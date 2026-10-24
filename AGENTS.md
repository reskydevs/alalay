# Global Machine & User Rules (ParaPo! Engineering Guide)

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
- **Always Show Full File Paths:** When referencing files or directories, always display the full absolute path in plain text or inline code (e.g., `D:\Dev\projects\parapo\app\_layout.tsx`) alongside any clickable markdown link. Never hide the full path behind only a short filename label.
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

## 5. ParaPo! UI/UX & Accessibility Design Guardrails
- **Unboxed Open-Canvas Layout (Tesla-Inspired):**
  - Use a pure pitch-black (`#000000`) background canvas.
  - Never nest bordered boxes inside boxes ("box within a box"). Utilize full-bleed horizontal and vertical screen space generously.
- **Frameless Iconography & Zero Redundant Buttons:**
  - Do not wrap icon buttons in rectangular or circular border containers when the icon itself clearly communicates the action.
  - Never duplicate the same action button or tab shortcut multiple times on the same screen.
- **Enlarged, Low-Friction Typography:**
  - Minimize header and subtitle text. Prioritize large, bold, high-contrast typography (`text-2xl` to `text-6xl`) readable from a distance or in moving transit.
- **Tactile & Visual Voice Feedback:**
  - Pair flashcard and speech interactions with haptic feedback, spring bounce animations, luminous glow states, and a ChatGPT Voice Mode-style animated orb/waveform (`components/VoiceOrb.tsx`).
  - Use inclusive, personality-based voice model names (`Juan`, `Amihan`, `Tala`, `Bagwis`, `Sinag`) without gender labels.
- **Custom Context-Specific Flat Vector Animations:**
  - Each flashcard must display an original, unmistakable animated vector illustration (`components/FlashcardScene.tsx`) matching its commuter intent (e.g., raised stop hand for `PARA PO!`, cash/coin for `BAYAD PO!`, `-20%` ID pass for `PWD / SENIOR`, coins in palm for `SUKLI PO!`, curbside pin for `SA TABI LANG!`).
- **Seamless In-App WebViews:**
  - Keep external portals (`ltfrb.gov.ph/fare-rates`) and Google Maps navigation inside in-app `<WebView>` containers with `intent://` fallback URL extraction so users are never jarringly ejected to external browser tabs.

---

## 6. ParaPo! Quick Reference Commands & Environment Paths

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
  cd D:\Dev\projects\parapo\android
  .\gradlew.bat assembleRelease
  ```
- **Install Release APK via ADB:**
  ```powershell
  & "D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe" -s 00170155D000432 install -r "D:\Dev\projects\parapo\android\app\build\outputs\apk\release\app-release.apk"
  ```
- **Launch App:**
  ```powershell
  & "D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe" -s 00170155D000432 shell monkey -p com.reskydevs.parapo -c android.intent.category.LAUNCHER 1
  ```
- **Capture Screenshot:**
  ```powershell
  & "D:\Dev\ToolData\Android-Sdk\platform-tools\adb.exe" -s 00170155D000432 exec-out screencap -p > screenshot.png
  ```
