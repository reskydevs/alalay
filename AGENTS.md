# Global Machine & User Rules (Alalay Engineering Guide)

## 1. Engineering Operating Rules (General-Purpose Workflow)
You are a staff-level software engineer acting as an autonomous coding partner. Optimize for correctness, maintainability, and fast execution.

### Core Principles
- **Smallest correct change:** Solve the root problem with the narrowest safe diff. Do not bundle unrelated formatting, cleanup, or speculative abstractions.
- **Follow existing conventions:** Match the repository's established architecture, naming, error handling, and testing patterns. Reuse existing helpers before writing new ones.
- **Autonomy over ceremony:** Execute tasks end-to-end (investigate → implement → verify) without stopping for routine confirmation.

### Autonomy & Decision Boundaries
- **Default to action:** When a detail is unspecified but has a clear idiomatic default, make the call and note the assumption briefly in your summary.
- **Stop and ask ONLY when:**
  1. The request has multiple conflicting interpretations with high rework cost.
  2. The change breaks an external public API/contract or requires a product-level decision.
  3. The operation is destructive or irreversible (e.g., deleting production data, force-pushing shared branches, modifying secrets/billing).
  4. Execution is blocked by missing credentials, permissions, or external access.

### Git Remote Safety (Push Invariant)
- **Never Push Automatically:** Never run `git push` to `origin` or any remote repository automatically. Formulate clean conventional commits locally, report the commit hash, and wait for the user to explicitly say when to push.

### Mandatory Documentation & Visual Asset Invariant
- **Always Synchronize `README.md`:** Any change in branding, architecture, transit data, or navigation patterns must immediately be reflected in `README.md`.
- **Physical Device Screenshot Fidelity:** Keep screenshot assets in `docs/screenshots/` synchronized with actual physical screen captures from the target device (Nothing Phone 3a Pro).

### Engineering Workflow & 2-Strike Debugging Discipline
1. **Inspect first:** Read relevant files, types, call sites, and existing tests before writing code.
2. **Fix root causes (2-strike discipline):** Address the underlying defect rather than masking symptoms. If two consecutive attempts fail validation, stop stacking patches and re-verify your mental model of the system.
3. **Keep diffs reviewable:** Touch only the lines necessary for the task. Write comments only to explain non-obvious *why* decisions, constraints, or invariants.
4. **Verify practically:**
   - Run the fastest targeted check that covers your change (e.g., single test file, typechecker, or linter) rather than the full suite unless cross-cutting changes require it.
   - Add or update focused tests when fixing bugs or introducing new behavior.
   - If a check cannot run in the current environment, finish the code, state plainly what remains unverified, and provide the exact command to run.

### Model Routing & Reasoning Effort
Match model selection (including subagent delegation) and thinking budget to the difficulty of the task:

| Tier | Target Model / Budget | Use Cases |
| :--- | :--- | :--- |
| **Fast Default** | **Flash Tier** (`Gemini 3.8 Flash` / Low–Medium thinking) | Routine feature work, localized bug fixes, test writing, boilerplate, mechanical refactors, and iterative edits. |
| **Deep Escalation** | **Pro / Argon Tier** (`Gemini 4 Argon` / Medium–High thinking) | Multi-module root-cause analysis, subtle race/state bugs, architectural design, complex migrations, and security-critical logic. |

- Do not overthink trivial or mechanical edits; reserve deep reasoning tokens for genuine ambiguity or system-wide complexity.

---

## 2. Communication & File Paths
- **Brief & High-Signal:** Keep updates concise and practical. State what changed, how it was verified, and any assumptions or tradeoffs.
- **Always Show Full File Paths:** When referencing files or directories, always display the full absolute path in plain text or inline code (e.g., `D:\Dev\projects\alalay\app\_layout.tsx`) alongside any clickable markdown link. Never hide the full path behind only a short filename label.
- **Desktop Location:** The active Windows Desktop directory on this machine is `C:\Users\ralph\OneDrive\Desktop`.

## 3. Storage & Drive Architecture (`C:` vs `D:\Dev`)
- **`C:` Drive is OS-Only:** Keep `C:` reserved for Windows OS files. Avoid installing large SDKs, virtual disks, or project repositories on `C:`.
- **`D:\Dev` is for Software Engineering:**
  - Coding projects belong under `D:\Dev\projects\`.
  - WSL2 distributions belong under `D:\Dev\WSL\` (default consolidated Ubuntu 24.04 LTS distro: `tadashi`, user `henrik`).
  - Developer tool data and SDK caches (VS Code extensions, JetBrains caches, Rust `.rustup`/`.cargo`, `.jdks`, `.m2`, `.local`, `.expo`, `.gradle`, `.android`, `Android-Sdk`) are stored under `D:\Dev\ToolData\` and linked from `C:\Users\ralph\...` via NTFS Directory Junctions (`mklink /J`).

## 4. Windows PowerShell Environment Quirk
- **`C:\Windows\System32` Explicit Paths:** Some PowerShell environments on this PC do not include `C:\Windows\System32` in `$env:PATH`. When writing scripts or invoking built-in Windows utilities (`robocopy.exe`, `cmd.exe`, `wsl.exe`), always use explicit full paths (`C:\Windows\System32\robocopy.exe`, `C:\Windows\System32\cmd.exe`, `C:\Windows\System32\wsl.exe`) or ensure `C:\Windows\System32` is prepended to `$env:PATH`.

---

## 5. Alalay UI/UX & Accessibility Design Guardrails
- **Unboxed Open-Canvas Layout (Tesla-Inspired):**
  - Use a pure pitch-black (`#000000`) background canvas.
  - Never nest bordered boxes inside boxes ("box within a box"). Utilize full-bleed horizontal and vertical screen space generously.
- **Android 15 Edge-to-Edge & Gesture Navigation Safety:**
  - Always elevate bottom navigation tab bars, floating action pills, and sticky footers using `useSafeAreaInsets().bottom` (`Math.max(insets.bottom, 16)`).
  - Never hardcode static small bottom padding (e.g. `paddingBottom: 10`), which collides with the Android gesture navigation pill on devices like Nothing Phone (3a) Pro.
- **Android 12+ / Android 15 Splash Screen Circular Mask Invariant:**
  - Android 12+ encloses `splashscreen_logo.png` inside a circular mask (~160dp viewport).
  - Never place brand text below the emblem in `splashscreen_logo.png`, as the circular viewport will clip it. The native splash logo must be the emblem alone, centered within circular safe boundaries.
  - Synchronize splash screen updates across both Expo (`assets/images/splash-icon.png`) and native Android drawable densities (`android/app/src/main/res/drawable-*/splashscreen_logo.png`).
- **Frameless Iconography & Zero Redundant Buttons:**
  - Do not wrap icon buttons in rectangular or circular border containers when the icon itself clearly communicates the action.
  - Never duplicate the same action button or tab shortcut multiple times on the same screen.
- **User-Controlled Documents (Anti-Template Principle):**
  - Never generate fake synthetic document templates (e.g., simulated ID numbers, fake barcodes, faux chips, or synthetic "Verified" badges) unless specifically requested.
  - Give users direct ownership to attach their own real documents via Camera capture or Photo Gallery, and provide inline renaming controls.
- **No Borrowed Branding or Comparative Claims:**
  - Never include third-party comparisons in user-facing UI copy (e.g. do not say "Google Wallet style security", "Apple-like encryption").
  - Use direct, honest on-device privacy notices: *"Stored locally on your device. Never uploaded online or to the cloud."*
- **Enlarged, Low-Friction Typography:**
  - Minimize header and subtitle text. Prioritize large, bold, high-contrast typography (`text-2xl` to `text-6xl`) readable from a distance or in moving transit.
- **Tactile & Visual Voice Feedback:**
  - Pair flashcard and speech interactions with haptic feedback, spring bounce animations, luminous glow states, and a ChatGPT Voice Mode-style animated orb/waveform (`components/VoiceOrb.tsx`).
  - Use neutral, numbered voice identifiers (`Voice 1`, `Voice 2`, `Voice 3`, etc.) to keep voices open and unbiased for all commuters.
- **Custom Context-Specific Flat Vector Animations:**
  - Each flashcard must display an original, unmistakable animated vector illustration (`components/FlashcardScene.tsx`) matching its commuter intent (e.g., raised stop hand for `PARA PO!`, cash/coin for `BAYAD PO!`, `-20%` ID pass for `PWD / SENIOR`, coins in palm for `SUKLI PO!`, curbside pin for `SA TABI LANG!`).
- **100% Offline Transit Hub & Native Navigation Intents:**
  - Prefer native offline data models over embedded WebViews to eliminate browser latency, save ~35MB RAM, and avoid Google TOS restrictions.
  - Provide a 1-tap native intent launcher (`Linking.openURL('google.navigation:q=...')` with `geo:` fallback) for real-time turn-by-turn GPS guidance.

---

## 5.1. Secure Systems & Dependable Software Engineering (Sommerville 10th Ed.)
All architectural decisions in Alalay must adhere to Ian Sommerville's *Software Engineering* (10th Edition):
- **Part 1: Secure Systems Design:**
  - *Principle of Least Privilege & Compartmentalization:* Store sensitive commuter documents (e.g. PWD, Senior IDs) strictly in local app sandbox storage (`FileSystem.documentDirectory`). Never upload or leak to external clouds or telemetry services.
  - *Zero Web Attack Surface:* Prefer native offline data models over embedded WebViews to eliminate XSS, cookie exfiltration, and DOM script injection risks.
  - *Strict Input Sanitization:* Strip control characters, newlines, and regex operators from user-entered strings (search queries, card names) and clamp lengths.
- **Part 2: Dependable Programming:**
  - *Multi-Tier Intent Fallback:* When triggering external services (like Google Maps), chain through a 3-tier fallback (`google.navigation:` intent -> `geo:` URI -> HTTPS URL).
  - *Storage Lifecycle Garbage Collection:* When user entities with associated files are deleted, delete the underlying disk file idempotently to prevent orphan storage leaks.
  - *Defensive Typing & Boundaries:* Maintain 100% strict TypeScript types without loose `any` casts.
- **Part 3: Resilience Engineering:**
  - *100% Offline Survivability:* Core transit lines, timetables, fare calculators, and flashcards must operate without an active internet connection.
  - *Multi-Modal Fallback:* Ensure flashcards function visually at 100% capacity if native TTS speech engines are absent or device volume is muted.

---

## 6. Alalay Quick Reference Commands & Environment Paths

### Environment & Tool Paths
- **Android SDK:** `D:\Dev\ToolData\Android-Sdk` (`ANDROID_HOME=D:\Dev\ToolData\Android-Sdk`)
- **ADB Executable:** `D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe`
- **JDK 17 Home:** `C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot`
- **Node.js (v22.12.0):** `C:\nvm4w\nodejs`
- **Target Device Flag:** Always use `-s 00170155D000432` for ADB commands to target Nothing Phone (3a) Pro (A059P, Android 15).

### Common Development & Verification Commands
- **Type Checking:**
  ```powershell
  $env:PATH = "C:\Windows\System32;" + $env:PATH
  npx tsc --noEmit
  ```
- **Linting:**
  ```powershell
  $env:PATH = "C:\Windows\System32;" + $env:PATH
  npm run lint
  ```
- **Start Expo Metro Bundler:**
  ```powershell
  $env:PATH = "C:\Windows\System32;" + $env:PATH
  npx expo start
  ```
- **Expo Prebuild (Android):**
  ```powershell
  $env:PATH = "C:\Windows\System32;" + $env:PATH
  npx expo prebuild --platform android
  ```
- **Compile Standalone Release APK:**
  ```powershell
  $env:PATH = "C:\Windows\System32;" + $env:PATH
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
  $env:ANDROID_HOME = "D:\Dev\ToolData\Android-Sdk"
  cd D:\Dev\projects\alalay\android
  .\gradlew.bat assembleRelease
  ```
- **Install Release APK via ADB:**
  ```powershell
  & "D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe" -s 00170155D000432 install -r "D:\Dev\projects\alalay\android\app\build\outputs\apk\release\app-release.apk"
  ```
- **Launch App:**
  ```powershell
  & "D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe" -s 00170155D000432 shell monkey -p com.reskydevs.alalay -c android.intent.category.LAUNCHER 1
  ```
- **Capture Screenshot (Zero-Phone-Chrome Auto-Cropped):**
  ```powershell
  .\scripts\bin\device.exe screenshot my_screen --crop
  ```

---

## 7. Mobile Screen Navigation & Device Driver Protocol (Zero Trial-and-Error)

When navigating, inspecting, or capturing screens on the target test device (Nothing Phone 3a Pro):
- **Never Guess Coordinates by Trial and Error:** Do not guess raw pixel coordinates or write one-off ad-hoc screen-tapping scripts.
- **Always Use the Cross-Agent Driver (`device.exe` or `device.py`):**
  - **Compiled Native Rust CLI:** `.\scripts\bin\device.exe <command>` (0ms startup, zero external dependencies).
  - **Python Fallback Companion:** `python .\scripts\device.py <command>` (reads the same `device_profiles.json`).
- **Standard Semantic Target Commands:**
  ```powershell
  # 1. Switch Bottom Navigation Tabs:
  .\scripts\bin\device.exe tap tab:commute
  .\scripts\bin\device.exe tap tab:communicate
  .\scripts\bin\device.exe tap tab:transit
  .\scripts\bin\device.exe tap tab:id

  # 2. Fare Guide Distance Presets & Vehicle Toggles:
  .\scripts\bin\device.exe tap preset:8km
  .\scripts\bin\device.exe tap preset:15km
  .\scripts\bin\device.exe tap vehicle:modern

  # 3. Tap Any Visible Text (Bypasses React Native Animation Quiescence Trap):
  .\scripts\bin\device.exe tap-text "Official LTFRB Rate Table"
  .\scripts\bin\device.exe tap-text "MRT-3"
  .\scripts\bin\device.exe tap-text "Hotline 1342"

  # 4. Close Modals:
  .\scripts\bin\device.exe tap btn:close

  # 5. Capture Zero-Chrome Cropped Screenshots (Auto-crops insets to 1080x2200):
  .\scripts\bin\device.exe screenshot screen_name --crop

  # 6. Dump Visible UI Hierarchy & Center Coordinates:
  .\scripts\bin\device.exe dump-ui
  ```
- **Authoritative Calibration Reference:** Full hardware profiles, insets (`118px` top, `74px` bottom), crop bounding boxes `(0, 118, 1080, 2318)`, and normalized canvas formulas are documented in [`D:\Dev\projects\alalay\DEVICE_CALIBRATION.md`](file:///D:/Dev/projects/alalay/DEVICE_CALIBRATION.md) and declared in [`D:\Dev\projects\alalay\device_profiles.json`](file:///D:/Dev/projects/alalay/device_profiles.json).
