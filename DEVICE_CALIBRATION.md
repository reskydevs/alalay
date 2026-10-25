# 📱 Alalay Mobile Device Calibration & Agent Navigation Guide

> **Standard Operating Manual for Google Antigravity, Claude Code, OpenAI Codex, and Human Engineers**  
> This specification documents the hardware profile, coordinate calibration, anti-quiescence animation protocols, and CLI driver usage for deterministic physical mobile screen interaction without trial-and-error.

---

## 📌 Table of Contents
1. [Calibrated Hardware Profiles](#1-calibrated-hardware-profiles)
2. [Zero-Phone-Chrome Inset & Crop Standards](#2-zero-phone-chrome-inset--crop-standards)
3. [The Cross-Agent CLI Drivers (`device.exe` & `device.py`)](#3-the-cross-agent-cli-drivers)
4. [Semantic Target Registry & Coordinate Map](#4-semantic-target-registry--coordinate-map)
5. [Normalized Coordinate Formula (0.0 to 1.0)](#5-normalized-coordinate-formula-00-to-10)
6. [Bypassing the React Native Animation Quiescence Trap](#6-bypassing-the-react-native-animation-quiescence-trap)
7. [Agent CLI Quick Reference](#7-agent-cli-quick-reference)

---

## 1. Calibrated Hardware Profiles

The primary physical verification device for Alalay is the **Nothing Phone (3a) Pro**:

| Property | Value | Notes |
| :--- | :--- | :--- |
| **Model** | Nothing Phone (3a) Pro (`A059P`) | Connected via USB Debugging |
| **ADB Serial Number** | `00170155D000432` | Flag: `-s 00170155D000432` |
| **OS Version** | Android 15 (Nothing OS 3.0) | Edge-to-edge mandatory enforcement |
| **Native Display Resolution** | `1080 x 2392` pixels | `480 dpi` (xxdpi scale factor `3.0`) |
| **Status Bar Height (Top)** | `118 px` | Measured from physical top edge (`y = 0` to `y = 118`) |
| **Gesture Navigation Inset (Bottom)** | `74 px` | System gesture navigation pill (`y = 2318` to `y = 2392`) |
| **Usable In-App Canvas** | `1080 x 2200` pixels | Viewport bounding box: `(0, 118, 1080, 2318)` |

Calibration data is declared centrally in [`D:\Dev\projects\alalay\device_profiles.json`](file:///D:/Dev/projects/alalay/device_profiles.json).

---

## 2. Zero-Phone-Chrome Inset & Crop Standards

All screenshots committed to documentation, pull requests, or presented to the user must follow the **Zero-Phone-Chrome Privacy Standard**:

```
+-------------------------------------------------------+ y = 0
|  STATUS BAR (Time, Battery, Wifi, Notifications)      | [EXCLUDED: y = 0..118]
+-------------------------------------------------------+ y = 118
|                                                       |
|                                                       |
|                                                       |
|               ACTIVE IN-APP CANVAS                    | [INCLUDED: 1080 x 2200]
|          (Viewport: 0, 118, 1080, 2318)               |
|                                                       |
|                                                       |
|                                                       |
+-------------------------------------------------------+ y = 2318
|  GESTURE NAVIGATION PILL (System Chrome)              | [EXCLUDED: y = 2318..2392]
+-------------------------------------------------------+ y = 2392
```

### Automatic Cropping:
Do NOT crop manually with ad-hoc image scripts. Run:
```powershell
.\scripts\bin\device.exe screenshot <name> --crop
```
The driver captures the screen directly from the ADB stdout pipe in memory, crops the exact `(0, 118, 1080, 2318)` rectangle using SIMD, and saves a pristine PNG in under **60 milliseconds**.

---

## 3. The Cross-Agent CLI Drivers

Alalay provides two complementary drivers that share the exact same CLI syntax and read the identical [`device_profiles.json`](file:///D:/Dev/projects/alalay/device_profiles.json):

### Primary: Native Rust Binary (`scripts/bin/device.exe`)
- **Location:** [`D:\Dev\projects\alalay\scripts\bin\device.exe`](file:///D:/Dev/projects/alalay/scripts/bin/device.exe)
- **Crate Source:** [`D:\Dev\projects\alalay\tools\device-driver\`](file:///D:/Dev/projects/alalay/tools/device-driver/)
- **Binary Size:** `0.90 MB` (stripped release with LTO)
- **Startup Latency:** `<10 ms`
- **Dependencies:** **Zero** (no Python, no npm, no pip, no virtualenvs).
- **Windows Safety:** Native UTF-8 streams; completely immune to Windows CP1252 charmap encoding crashes.

### Fallback Companion: Python Driver (`scripts/device.py`)
- **Location:** [`D:\Dev\projects\alalay\scripts\device.py`](file:///D:/Dev/projects/alalay/scripts/device.py)
- **Interpreter:** Python 3.10+ (requires `Pillow` for screenshot cropping).
- **Usage:** Identical CLI argument signature (`python scripts/device.py ...`).

---

## 4. Semantic Target Registry & Coordinate Map

Coordinates are **decoupled from code** and stored in [`D:\Dev\projects\alalay\device_profiles.json`](file:///D:/Dev/projects/alalay/device_profiles.json). When screens are updated or new buttons added, edit the JSON file; **no recompilation is ever required**.

### Calibrated Targets (Nothing Phone 3a Pro):

| Semantic Alias | Description | Physical Pixel (X, Y) | Normalized (X, Y) |
| :--- | :--- | :--- | :--- |
| **`tab:commute`** | Bottom Navigation: Commute Tab | `(135, 2300)` | `(0.125, 0.992)` |
| **`tab:communicate`** | Bottom Navigation: Communicate Tab | `(405, 2300)` | `(0.375, 0.992)` |
| **`tab:transit`** | Bottom Navigation: Transit Directory Tab | `(675, 2300)` | `(0.625, 0.992)` |
| **`tab:id`** | Bottom Navigation: My ID Pass Tab | `(945, 2300)` | `(0.875, 0.992)` |
| **`preset:4km`** | Commute Screen: 4 km Distance Preset | `(135, 2158)` | `(0.125, 0.927)` |
| **`preset:6km`** | Commute Screen: 6 km Distance Preset | `(315, 2158)` | `(0.292, 0.927)` |
| **`preset:8km`** | Commute Screen: 8 km Distance Preset | `(500, 2158)` | `(0.463, 0.927)` |
| **`preset:10km`** | Commute Screen: 10 km Distance Preset | `(685, 2158)` | `(0.634, 0.927)` |
| **`preset:15km`** | Commute Screen: 15 km Distance Preset | `(870, 2158)` | `(0.806, 0.927)` |
| **`vehicle:jeepney`** | Commute Screen: Jeepney Mode Button | `(200, 1968)` | `(0.185, 0.841)` |
| **`vehicle:modern`** | Commute Screen: Modern PUV Mode Button | `(500, 1968)` | `(0.463, 0.841)` |
| **`vehicle:uv`** | Commute Screen: UV Express Mode Button | `(800, 1968)` | `(0.741, 0.841)` |
| **`btn:fare_guide`** | Commute Screen: Fare Guide Detailed Row | `(300, 1718)` | `(0.278, 0.727)` |
| **`btn:rate_table`** | Fare Modal: Official LTFRB Rate Table Button | `(540, 2220)` | `(0.500, 0.955)` |
| **`btn:close`** | Standard Top-Right Modal Close Button | `(950, 180)` | `(0.880, 0.028)` |
| **`btn:discount_switch`** | Commute Screen: 20% Discount Toggle Switch | `(950, 2250)` | `(0.880, 0.969)` |

---

## 5. Normalized Coordinate Formula (0.0 to 1.0)

When tapping arbitrary custom locations across the app canvas, agents can pass canvas-relative normalized coordinates `fx,fy` (`0.0 <= fx <= 1.0`, `0.0 <= fy <= 1.0`):

$$\text{Physical } X = \text{round}(fx \times \text{Canvas Width}) = \text{round}(fx \times 1080)$$

$$\text{Physical } Y = \text{round}(\text{Status Bar Top} + fy \times \text{Canvas Height}) = \text{round}(118 + fy \times 2200)$$

### Usage:
```powershell
# Taps the exact center of the usable in-app canvas:
.\scripts\bin\device.exe tap 0.5,0.5
```

---

## 6. Bypassing the React Native Animation Quiescence Trap

### The Problem:
React Native applications with looping or continuous animations (e.g. `VoiceOrb` pulsing harmonic aura, Reanimated spring physics loops) prevent Android's accessibility system from detecting an `IDLE` state. Standard `adb shell uiautomator dump` hangs for up to 30 seconds and crashes:
```
ERROR: could not get idle state.
```

### The Driver's Automatic Solution:
The `device` driver transparently bypasses this via automated animation scale suspension:
1. `adb shell settings put global animator_duration_scale 0`
2. `adb shell settings put global transition_animation_scale 0`
3. `adb shell uiautomator dump --compressed /sdcard/device_dump.xml` (completes in `<180 ms`)
4. Restores user animations immediately:
   `adb shell settings put global animator_duration_scale 1`
   `adb shell settings put global transition_animation_scale 1`
5. Parses node text, bounds, and fires the click automatically.

### Usage:
```powershell
# Instantly finds any text on screen, computes center, and taps it:
.\scripts\bin\device.exe tap-text "MRT-3"
.\scripts\bin\device.exe tap-text "Modern PUV"
.\scripts\bin\device.exe tap-text "Hotline 1342"
```

---

## 7. Agent CLI Quick Reference

Agents should use these single-line commands instead of raw ADB trial-and-error:

```powershell
# 1. Switch Bottom Navigation Tabs:
.\scripts\bin\device.exe tap tab:commute
.\scripts\bin\device.exe tap tab:communicate
.\scripts\bin\device.exe tap tab:transit
.\scripts\bin\device.exe tap tab:id

# 2. Distance Presets & Vehicle Toggles:
.\scripts\bin\device.exe tap preset:8km
.\scripts\bin\device.exe tap preset:15km
.\scripts\bin\device.exe tap vehicle:modern

# 3. Tap Any Visible Text Directly (Safe Dump):
.\scripts\bin\device.exe tap-text "Official LTFRB Rate Table"
.\scripts\bin\device.exe tap-text "All Lines"

# 4. Modal Close:
.\scripts\bin\device.exe tap btn:close

# 5. Capture Zero-Chrome Cropped Screenshot:
.\scripts\bin\device.exe screenshot my_screen_name --crop

# 6. Inspect Active Device Calibration:
.\scripts\bin\device.exe info

# 7. Dump All Visible Interactive Nodes:
.\scripts\bin\device.exe dump-ui
```
