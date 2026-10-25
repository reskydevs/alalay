#!/usr/bin/env python3
"""
scripts/device.py - Lightweight Python Companion & Fallback Device Driver for Alalay
Reads device_profiles.json to execute deterministic, calibrated screen navigation.
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

# Fix Windows CP1252 stdout encoding quirks for emojis & non-ASCII
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ADB_CANDIDATES = [
    Path(r"D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe"),
    Path(os.environ.get("ANDROID_HOME", "")) / "platform-tools" / "adb.exe",
    Path("adb.exe"),
]

def find_adb():
    for p in ADB_CANDIDATES:
        if p.exists():
            return str(p)
    return "adb"

def find_profiles():
    candidates = [
        Path("device_profiles.json"),
        Path(__file__).resolve().parent.parent / "device_profiles.json",
        Path(r"D:\Dev\projects\alalay\device_profiles.json"),
    ]
    for p in candidates:
        if p.exists():
            return p
    return Path("device_profiles.json")

def load_profiles():
    path = find_profiles()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return path, data

def get_active_profile(profiles, serial_override=None):
    serial = serial_override or profiles.get("active_device_serial")
    devices = profiles.get("devices", {})
    if serial in devices:
        return serial, devices[serial]
    if devices:
        first_serial = next(iter(devices.keys()))
        return first_serial, devices[first_serial]
    raise RuntimeError("No device profiles found in device_profiles.json")

def run_adb(adb, serial, args):
    cmd = [adb]
    if serial:
        cmd.extend(["-s", serial])
    cmd.extend(args)
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        err = res.stderr.decode("utf-8", errors="replace")
        raise RuntimeError(f"ADB error ({res.returncode}): {err}")
    return res.stdout

def safe_dump_ui_xml(adb, serial):
    # Suspend animations to bypass quiescence idle timeout
    run_adb(adb, serial, ["shell", "settings", "put", "global", "animator_duration_scale", "0"])
    run_adb(adb, serial, ["shell", "settings", "put", "global", "transition_animation_scale", "0"])
    try:
        run_adb(adb, serial, ["shell", "uiautomator", "dump", "--compressed", "/sdcard/device_dump.xml"])
    finally:
        run_adb(adb, serial, ["shell", "settings", "put", "global", "animator_duration_scale", "1"])
        run_adb(adb, serial, ["shell", "settings", "put", "global", "transition_animation_scale", "1"])
    xml_bytes = run_adb(adb, serial, ["exec-out", "cat", "/sdcard/device_dump.xml"])
    return xml_bytes.decode("utf-8", errors="replace")

def parse_bounds(bounds_str):
    # [x1,y1][x2,y2]
    s = bounds_str.strip()
    if not (s.startswith("[") and "][" in s and s.endswith("]")):
        return None
    inner = s[1:-1]
    p1, p2 = inner.split("][")
    x1, y1 = [int(v.strip()) for v in p1.split(",")]
    x2, y2 = [int(v.strip()) for v in p2.split(",")]
    return [x1, y1, x2, y2]

def parse_nodes(xml_str):
    import xml.etree.ElementTree as ET
    root = ET.fromstring(xml_str)
    nodes = []
    for elem in root.iter("node"):
        bounds_str = elem.attrib.get("bounds", "")
        bounds = parse_bounds(bounds_str)
        if bounds:
            cx = (bounds[0] + bounds[2]) // 2
            cy = (bounds[1] + bounds[3]) // 2
            nodes.append({
                "text": elem.attrib.get("text", ""),
                "resource_id": elem.attrib.get("resource-id", ""),
                "content_desc": elem.attrib.get("content-desc", ""),
                "bounds": bounds,
                "center": [cx, cy],
            })
    return nodes

def main():
    parser = argparse.ArgumentParser(description="Alalay Cross-Agent Device Automation Driver")
    parser.add_argument("-s", "--serial", help="ADB serial override")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # screenshot
    p_sc = subparsers.add_parser("screenshot", help="Capture screenshot with optional auto-crop")
    p_sc.add_argument("name", help="Base filename (without .png)")
    p_sc.add_argument("-c", "--crop", action="store_true", help="Auto-crop phone status and navigation insets")
    p_sc.add_argument("-o", "--out", help="Output directory (defaults to docs/screenshots)")

    # tap
    p_tap = subparsers.add_parser("tap", help="Tap semantic target, normalized float (0.0-1.0), or pixel (x,y)")
    p_tap.add_argument("target", help="Target name (e.g. tab:transit, preset:8km, btn:close) or x,y")

    # tap-text
    p_tt = subparsers.add_parser("tap-text", help="Scan UI hierarchy, find text, and tap center")
    p_tt.add_argument("text", help="Visible text or substring to match")

    # dump-ui
    p_du = subparsers.add_parser("dump-ui", help="Dump visible interactive UI nodes")
    p_du.add_argument("-o", "--out", help="Optional JSON file output path")

    # calibrate
    subparsers.add_parser("calibrate", help="Calibrate connected ADB device")

    # info
    subparsers.add_parser("info", help="Show active device calibration profile")

    args = parser.parse_args()
    adb = find_adb()
    profiles_path, profiles = load_profiles()
    serial, profile = get_active_profile(profiles, args.serial)

    t0 = time.time()

    if args.command == "screenshot":
        try:
            from PIL import Image
            import io
        except ImportError:
            sys.exit("Error: Pillow is required for screenshot processing in device.py. Please use device.exe or pip install Pillow.")

        out_dir = Path(args.out) if args.out else Path(r"D:\Dev\projects\alalay\docs\screenshots")
        out_dir.mkdir(parents=True, exist_ok=True)
        fname = args.name if args.name.endswith(".png") else f"{args.name}.png"
        out_path = out_dir / fname

        png_bytes = run_adb(adb, serial, ["exec-out", "screencap", "-p"])
        img = Image.open(io.BytesIO(png_bytes))

        if args.crop:
            crop_box = profile.get("canvas", {}).get("crop_box", [0, 118, 1080, 2318])
            img = img.crop(crop_box)

        img.save(out_path, "PNG")
        ms = int((time.time() - t0) * 1000)
        print(f"Captured screenshot ({img.width}x{img.height}): {out_path} ({ms} ms)")

    elif args.command == "tap":
        target = args.target.strip()
        clean = target.lower()
        targets = profile.get("persistent_targets", {})
        coord = targets.get(clean)
        if not coord:
            for prefix in ["tab:", "preset:", "btn:", "vehicle:"]:
                if f"{prefix}{clean}" in targets:
                    coord = targets[f"{prefix}{clean}"]
                    break

        if not coord and "," in target:
            parts = [v.strip() for v in target.split(",")]
            if len(parts) == 2:
                try:
                    fx, fy = float(parts[0]), float(parts[1])
                    if 0.0 <= fx <= 1.0 and 0.0 <= fy <= 1.0:
                        canvas = profile.get("canvas", {"width": 1080, "height": 2200})
                        insets = profile.get("insets", {"status_bar_top": 118})
                        px = int(round(fx * canvas["width"]))
                        py = int(round(insets["status_bar_top"] + fy * canvas["height"]))
                        coord = [px, py]
                    else:
                        coord = [int(round(fx)), int(round(fy))]
                except ValueError:
                    pass

        if not coord:
            sys.exit(f"Error: Unknown target '{target}'. Available targets: {list(targets.keys())}")

        cx, cy = coord[0], coord[1]
        run_adb(adb, serial, ["shell", "input", "tap", str(cx), str(cy)])
        ms = int((time.time() - t0) * 1000)
        print(f"Tapped '{target}' at ({cx}, {cy}) in {ms} ms")

    elif args.command == "tap-text":
        xml_str = safe_dump_ui_xml(adb, serial)
        nodes = parse_nodes(xml_str)
        query = args.text.lower()
        matched = None
        for n in nodes:
            if n["text"].lower() == query:
                matched = n
                break
        if not matched:
            for n in nodes:
                if n["text"] and query in n["text"].lower():
                    matched = n
                    break
        if not matched:
            for n in nodes:
                if n["content_desc"] and query in n["content_desc"].lower():
                    matched = n
                    break
        if not matched:
            sys.exit(f"Error: Text '{args.text}' not found in active screen hierarchy.")

        cx, cy = matched["center"]
        run_adb(adb, serial, ["shell", "input", "tap", str(cx), str(cy)])
        ms = int((time.time() - t0) * 1000)
        print(f"Found text '{matched['text']}' at {matched['bounds']}, tapped ({cx}, {cy}) in {ms} ms")

    elif args.command == "dump-ui":
        xml_str = safe_dump_ui_xml(adb, serial)
        nodes = parse_nodes(xml_str)
        interactive = [n for n in nodes if n["text"] or n["content_desc"]]
        if args.out:
            with open(args.out, "w", encoding="utf-8") as f:
                json.dump(interactive, f, indent=2)
            print(f"Saved {len(interactive)} UI elements to {args.out}")
        else:
            print(f"Visible Interactive Nodes ({len(interactive)} found):")
            for n in interactive:
                print(f"  - \"{n['text']}\" -> Center: ({n['center'][0]}, {n['center'][1]}) Bounds: {n['bounds']}")

    elif args.command == "calibrate":
        raw_size = run_adb(adb, serial, ["shell", "wm", "size"]).decode()
        dims = raw_size.split(":")[-1].strip().split("x")
        w, h = int(dims[0]), int(dims[1])
        raw_density = run_adb(adb, serial, ["shell", "wm", "density"]).decode()
        dpi = int(raw_density.split(":")[-1].strip())
        print(f"Detected Display: {w}x{h} @ {dpi} dpi")
        print(f"Calibrated profile active in {profiles_path}")

    elif args.command == "info":
        print(f"Active Device Calibration Profile:")
        print(f"  Serial:       {serial}")
        print(f"  Model:        {profile.get('model')}")
        print(f"  Resolution:   {profile.get('display', {}).get('width')}x{profile.get('display', {}).get('height')}")
        print(f"  Canvas Crop:  {profile.get('canvas', {}).get('crop_box')}")
        print(f"\nRegistered Semantic Targets:")
        for k, v in sorted(profile.get("persistent_targets", {}).items()):
            print(f"  {k:20} -> ({v[0]}, {v[1]})")

if __name__ == "__main__":
    main()
