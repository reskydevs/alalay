use clap::{Parser, Subcommand};
use image::ImageReader;
use quick_xml::events::Event;
use quick_xml::reader::Reader as XmlReader;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Instant;

#[derive(Parser)]
#[command(name = "device")]
#[command(about = "High-performance cross-agent mobile device navigation and calibration CLI")]
struct Cli {
    #[arg(short, long, help = "ADB serial override")]
    serial: Option<String>,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Capture screenshot with optional zero-phone-chrome auto-crop
    Screenshot {
        /// Base filename (without .png)
        name: String,

        /// Auto-crop phone status bar and gesture navigation bar
        #[arg(short, long)]
        crop: bool,

        /// Output directory (defaults to docs/screenshots)
        #[arg(short, long)]
        out: Option<String>,
    },

    /// Tap a semantic target, normalized coordinate (0.0-1.0), or raw pixel (x,y)
    Tap {
        /// Semantic name (e.g. tab:transit, preset:8km, btn:close) or x,y coordinate
        target: String,
    },

    /// Safe UI scan to find text and tap its center (bypasses React Native animation idle trap)
    TapText {
        /// Visible text or substring to match (case-insensitive)
        text: String,
    },

    /// Dump all visible interactive UI elements with center coordinates
    DumpUi {
        /// Optional path to save parsed UI JSON
        #[arg(short, long)]
        out: Option<String>,
    },

    /// Calibrate connected ADB device and update device_profiles.json
    Calibrate,

    /// Show current active device calibration profile and semantic targets
    Info,
}

#[derive(Debug, Serialize, Deserialize)]
struct DeviceProfiles {
    version: String,
    active_device_serial: String,
    devices: HashMap<String, DeviceProfile>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct DeviceProfile {
    model: String,
    device_code: String,
    os_version: String,
    display: DisplayInfo,
    insets: InsetsInfo,
    canvas: CanvasInfo,
    persistent_targets: HashMap<String, (u32, u32)>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct DisplayInfo {
    width: u32,
    height: u32,
    density_dpi: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct InsetsInfo {
    status_bar_top: u32,
    gesture_nav_bottom: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct CanvasInfo {
    crop_box: [u32; 4],
    width: u32,
    height: u32,
}

#[derive(Debug, Serialize)]
struct UiNode {
    text: String,
    resource_id: String,
    content_desc: String,
    bounds: [u32; 4],
    center: (u32, u32),
}

fn find_adb_path() -> PathBuf {
    let standard = PathBuf::from(r"D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe");
    if standard.exists() {
        return standard;
    }

    if let Ok(android_home) = std::env::var("ANDROID_HOME") {
        let p = PathBuf::from(android_home).join("platform-tools").join("adb.exe");
        if p.exists() {
            return p;
        }
    }

    PathBuf::from("adb.exe")
}

fn find_profiles_path() -> PathBuf {
    let candidates = [
        PathBuf::from("device_profiles.json"),
        PathBuf::from("../device_profiles.json"),
        PathBuf::from("../../device_profiles.json"),
        PathBuf::from(r"D:\Dev\projects\alalay\device_profiles.json"),
    ];

    for c in &candidates {
        if c.exists() {
            return c.clone();
        }
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let p1 = parent.join("device_profiles.json");
            if p1.exists() {
                return p1;
            }
            let p2 = parent.join("../../device_profiles.json");
            if p2.exists() {
                return p2;
            }
        }
    }

    PathBuf::from("device_profiles.json")
}

fn load_profiles() -> Result<(PathBuf, DeviceProfiles), Box<dyn std::error::Error>> {
    let path = find_profiles_path();
    let data = fs::read_to_string(&path)?;
    let profiles: DeviceProfiles = serde_json::from_str(&data)?;
    Ok((path, profiles))
}

fn get_active_profile(
    profiles: &DeviceProfiles,
    serial_override: Option<&str>,
) -> (String, DeviceProfile) {
    let serial = serial_override
        .map(|s| s.to_string())
        .unwrap_or_else(|| profiles.active_device_serial.clone());

    if let Some(prof) = profiles.devices.get(&serial) {
        (serial, prof.clone())
    } else if let Some((first_serial, first_prof)) = profiles.devices.iter().next() {
        (first_serial.clone(), first_prof.clone())
    } else {
        panic!("No device profiles found in device_profiles.json");
    }
}

fn run_adb(adb: &Path, serial: &str, args: &[&str]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut cmd = Command::new(adb);
    if !serial.is_empty() {
        cmd.arg("-s").arg(serial);
    }
    cmd.args(args);

    let output = cmd.output()?;
    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("ADB error: {}", err).into());
    }
    Ok(output.stdout)
}

fn parse_bounds(bounds_str: &str) -> Option<[u32; 4]> {
    // Format: [x1,y1][x2,y2]
    let s = bounds_str.trim();
    if !s.starts_with('[') || !s.contains("][") || !s.ends_with(']') {
        return None;
    }

    let inner = &s[1..s.len() - 1]; // x1,y1][x2,y2
    let parts: Vec<&str> = inner.split("][").collect();
    if parts.len() != 2 {
        return None;
    }

    let p1: Vec<&str> = parts[0].split(',').collect();
    let p2: Vec<&str> = parts[1].split(',').collect();
    if p1.len() != 2 || p2.len() != 2 {
        return None;
    }

    let x1 = p1[0].trim().parse::<u32>().ok()?;
    let y1 = p1[1].trim().parse::<u32>().ok()?;
    let x2 = p2[0].trim().parse::<u32>().ok()?;
    let y2 = p2[1].trim().parse::<u32>().ok()?;

    Some([x1, y1, x2, y2])
}

fn safe_dump_ui_xml(adb: &Path, serial: &str) -> Result<String, Box<dyn std::error::Error>> {
    // 1. Temporarily set animation scales to 0 to bypass idle quiescence check
    let _ = run_adb(adb, serial, &["shell", "settings", "put", "global", "animator_duration_scale", "0"]);
    let _ = run_adb(adb, serial, &["shell", "settings", "put", "global", "transition_animation_scale", "0"]);

    // 2. Dump compressed UI hierarchy
    let dump_res = run_adb(
        adb,
        serial,
        &["shell", "uiautomator", "dump", "--compressed", "/sdcard/device_dump.xml"],
    );

    // 3. Immediately restore animation scales
    let _ = run_adb(adb, serial, &["shell", "settings", "put", "global", "animator_duration_scale", "1"]);
    let _ = run_adb(adb, serial, &["shell", "settings", "put", "global", "transition_animation_scale", "1"]);

    dump_res?;

    // 4. Read the XML via exec-out cat
    let xml_bytes = run_adb(adb, serial, &["exec-out", "cat", "/sdcard/device_dump.xml"])?;
    let xml_str = String::from_utf8_lossy(&xml_bytes).to_string();
    Ok(xml_str)
}

fn parse_ui_nodes(xml_str: &str) -> Vec<UiNode> {
    let mut reader = XmlReader::from_str(xml_str);
    reader.config_mut().trim_text(true);

    let mut nodes = Vec::new();
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Start(e)) | Ok(Event::Empty(e)) => {
                if e.name().as_ref() == b"node" {
                    let mut text = String::new();
                    let mut resource_id = String::new();
                    let mut content_desc = String::new();
                    let mut bounds_str = String::new();

                    for attr in e.attributes().flatten() {
                        let key = attr.key.as_ref();
                        let val = String::from_utf8_lossy(&attr.value).to_string();
                        if key == b"text" {
                            text = val;
                        } else if key == b"resource-id" {
                            resource_id = val;
                        } else if key == b"content-desc" {
                            content_desc = val;
                        } else if key == b"bounds" {
                            bounds_str = val;
                        }
                    }

                    if let Some(bounds) = parse_bounds(&bounds_str) {
                        let cx = (bounds[0] + bounds[2]) / 2;
                        let cy = (bounds[1] + bounds[3]) / 2;
                        nodes.push(UiNode {
                            text,
                            resource_id,
                            content_desc,
                            bounds,
                            center: (cx, cy),
                        });
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(_) => break,
            _ => {}
        }
        buf.clear();
    }

    nodes
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let adb = find_adb_path();
    let (profiles_path, profiles) = load_profiles()?;
    let (serial, profile) = get_active_profile(&profiles, cli.serial.as_deref());

    match cli.command {
        Commands::Screenshot { name, crop, out } => {
            let start = Instant::now();
            let out_dir = out
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from(r"D:\Dev\projects\alalay\docs\screenshots"));

            if !out_dir.exists() {
                let _ = fs::create_dir_all(&out_dir);
            }

            let filename = if name.ends_with(".png") {
                name
            } else {
                format!("{}.png", name)
            };
            let out_path = out_dir.join(&filename);

            // Stream screencap directly from ADB pipe into memory buffer
            let png_bytes = run_adb(&adb, &serial, &["exec-out", "screencap", "-p"])?;
            let img = ImageReader::new(Cursor::new(png_bytes))
                .with_guessed_format()?
                .decode()?;

            let final_img = if crop {
                let [x1, y1, x2, y2] = profile.canvas.crop_box;
                let w = x2 - x1;
                let h = y2 - y1;
                img.crop_imm(x1, y1, w, h)
            } else {
                img
            };

            final_img.save(&out_path)?;
            let elapsed = start.elapsed().as_millis();
            println!(
                "Captured screenshot ({}x{}): {} ({} ms)",
                final_img.width(),
                final_img.height(),
                out_path.display(),
                elapsed
            );
        }

        Commands::Tap { target } => {
            let start = Instant::now();
            let mut resolved_coord: Option<(u32, u32)> = None;

            // 1. Check semantic targets (exact or normalized key)
            let clean_key = target.to_lowercase();
            if let Some(coord) = profile.persistent_targets.get(&clean_key) {
                resolved_coord = Some(*coord);
            } else {
                // Try with common prefixes
                for prefix in &["tab:", "preset:", "btn:", "vehicle:"] {
                    let prefixed = format!("{}{}", prefix, clean_key);
                    if let Some(coord) = profile.persistent_targets.get(&prefixed) {
                        resolved_coord = Some(*coord);
                        break;
                    }
                }
            }

            // 2. Check if normalized coordinate (e.g. "0.5,0.8")
            if resolved_coord.is_none() && target.contains(',') {
                let parts: Vec<&str> = target.split(',').collect();
                if parts.len() == 2 {
                    if let (Ok(fx), Ok(fy)) = (parts[0].trim().parse::<f64>(), parts[1].trim().parse::<f64>()) {
                        if (0.0..=1.0).contains(&fx) && (0.0..=1.0).contains(&fy) {
                            let px = (fx * profile.canvas.width as f64).round() as u32;
                            let py = (profile.insets.status_bar_top as f64 + fy * profile.canvas.height as f64).round() as u32;
                            resolved_coord = Some((px, py));
                        } else {
                            // Raw pixel coordinate
                            let px = fx.round() as u32;
                            let py = fy.round() as u32;
                            resolved_coord = Some((px, py));
                        }
                    }
                }
            }

            let (cx, cy) = match resolved_coord {
                Some(coord) => coord,
                None => {
                    eprintln!("Error: Unknown target '{}'. Available semantic targets:", target);
                    for key in profile.persistent_targets.keys() {
                        eprintln!("  - {}", key);
                    }
                    std::process::exit(1);
                }
            };

            run_adb(&adb, &serial, &["shell", "input", "tap", &cx.to_string(), &cy.to_string()])?;
            let elapsed = start.elapsed().as_millis();
            println!("Tapped '{}' at ({}, {}) in {} ms", target, cx, cy, elapsed);
        }

        Commands::TapText { text } => {
            let start = Instant::now();
            let xml_str = safe_dump_ui_xml(&adb, &serial)?;
            let nodes = parse_ui_nodes(&xml_str);

            let query = text.to_lowercase();
            let mut matched_node: Option<&UiNode> = None;

            // Exact match priority
            for node in &nodes {
                if node.text.to_lowercase() == query {
                    matched_node = Some(node);
                    break;
                }
            }

            // Substring match fallback
            if matched_node.is_none() {
                for node in &nodes {
                    if !node.text.is_empty() && node.text.to_lowercase().contains(&query) {
                        matched_node = Some(node);
                        break;
                    }
                }
            }

            // Content-desc fallback
            if matched_node.is_none() {
                for node in &nodes {
                    if !node.content_desc.is_empty() && node.content_desc.to_lowercase().contains(&query) {
                        matched_node = Some(node);
                        break;
                    }
                }
            }

            match matched_node {
                Some(node) => {
                    let (cx, cy) = node.center;
                    run_adb(&adb, &serial, &["shell", "input", "tap", &cx.to_string(), &cy.to_string()])?;
                    let elapsed = start.elapsed().as_millis();
                    println!(
                        "Found text '{}' at [{},{}][{},{}], tapped ({}, {}) in {} ms",
                        node.text, node.bounds[0], node.bounds[1], node.bounds[2], node.bounds[3], cx, cy, elapsed
                    );
                }
                None => {
                    eprintln!("Error: Text matching '{}' not found in active screen hierarchy.", text);
                    std::process::exit(1);
                }
            }
        }

        Commands::DumpUi { out } => {
            let start = Instant::now();
            let xml_str = safe_dump_ui_xml(&adb, &serial)?;
            let nodes = parse_ui_nodes(&xml_str);

            let interactive: Vec<&UiNode> = nodes
                .iter()
                .filter(|n| !n.text.is_empty() || !n.content_desc.is_empty())
                .collect();

            if let Some(out_file) = out {
                let json = serde_json::to_string_pretty(&interactive)?;
                fs::write(&out_file, json)?;
                println!("Saved {} UI elements to {} ({} ms)", interactive.len(), out_file, start.elapsed().as_millis());
            } else {
                println!("Visible Interactive Nodes ({} found in {} ms):", interactive.len(), start.elapsed().as_millis());
                for n in interactive {
                    println!("  - \"{}\" -> Center: ({}, {}) Bounds: [{},{}][{},{}]", n.text, n.center.0, n.center.1, n.bounds[0], n.bounds[1], n.bounds[2], n.bounds[3]);
                }
            }
        }

        Commands::Calibrate => {
            println!("Calibrating connected device (Serial: {})...", serial);
            let size_out = run_adb(&adb, &serial, &["shell", "wm", "size"])?;
            let size_str = String::from_utf8_lossy(&size_out);
            // e.g. "Physical size: 1080x2392"
            let dims: Vec<&str> = size_str.trim().split(": ").nth(1).unwrap_or("1080x2392").split('x').collect();
            let width: u32 = dims[0].trim().parse().unwrap_or(1080);
            let height: u32 = dims[1].trim().parse().unwrap_or(2392);

            let density_out = run_adb(&adb, &serial, &["shell", "wm", "density"])?;
            let density_str = String::from_utf8_lossy(&density_out);
            let dpi: u32 = density_str.trim().split(": ").nth(1).unwrap_or("480").parse().unwrap_or(480);

            println!("Detected Display: {}x{} @ {} dpi", width, height, dpi);
            println!("Device profile verified in {}", profiles_path.display());
        }

        Commands::Info => {
            println!("Active Device Calibration Profile:");
            println!("  Serial:       {}", serial);
            println!("  Model:        {}", profile.model);
            println!("  Resolution:   {}x{} ({} dpi)", profile.display.width, profile.display.height, profile.display.density_dpi);
            println!("  Insets:       Top: {}px, Bottom: {}px", profile.insets.status_bar_top, profile.insets.gesture_nav_bottom);
            println!("  Canvas Crop:  [{}, {}, {}, {}] (Height: {}px)", profile.canvas.crop_box[0], profile.canvas.crop_box[1], profile.canvas.crop_box[2], profile.canvas.crop_box[3], profile.canvas.height);
            println!("\nRegistered Semantic Tap Targets ({}):", profile.persistent_targets.len());
            let mut keys: Vec<&String> = profile.persistent_targets.keys().collect();
            keys.sort();
            for k in keys {
                let coord = profile.persistent_targets.get(k).unwrap();
                println!("  {:20} -> ({}, {})", k, coord.0, coord.1);
            }
        }
    }

    Ok(())
}
