# ParaPo! 👋

This is a [React Native with Expo](https://reactnative.dev/docs/environment-setup) project created by running `npx create-expo-app@latest`

## Table of Contents
- [ParaPo! 👋](#parapo-)
  - [Table of Contents](#table-of-contents)
  - [About The Project](#about-the-project)
    - [Built With](#built-with)
  - [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Tests](#tests)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [Authors](#authors)
  - [Acknowledgments](#acknowledgments)
  - [Version History](#version-history)

---

## About The Project

ParaPo! is an accessibility-friendly app for Filipino commuters, designed for persons with disabilities (PWDs) such as those who are deaf, have speech or mobility impairments, or experience communication challenges. It offers tap-to-play voice prompts like “Para po!” and “Bayad po, papuntang [location]”, along with visual animations to help users easily interact with drivers and conductors—making public transport more inclusive, safe, and stress-free. More helpful features are also built in, designed with accessibility and everyday commuting needs in mind.

### Built With

[![React Native](https://img.shields.io/badge/-React%20Native-black?style=flat&logo=react)](https://reactnative.dev/) – Core framework for building native mobile apps.  
[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo)](https://expo.dev/) – Toolchain for rapid React Native development.  
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) – Main programming language for app logic and UI

[⬆️ Back to Top](#table-of-contents)

---

## Setup

### Prerequisites

- [VS Code](https://code.visualstudio.com/)
- [Warp Terminal](https://www.warp.dev/download)  
- [git & git bash](https://git-scm.com/)   
- [Google Chrome](https://www.google.com/chrome/)  
- [Node Version Manager (NVM)](https://github.com/coreybutler/nvm-windows)

**NVM Install Guide:**
1. Go to [nvm-windows releases](https://github.com/coreybutler/nvm-windows/releases)
2. Download and install the `.exe` file of the latest release
3. Complete the Installation Wizard
4. Confirm installation:
   ```sh
   nvm -v
   ```
5. Install and use the required Node.js version for this project:
   ```sh
   nvm install v22.12.0
   nvm use v22.12.0
   ```
   
To confirm you have the required tools installed, run the following commands in your terminal:

```sh
node -v
npm -v
git -v
```

- **On your device**  
  - [Expo Go for Android ![Android](https://img.shields.io/badge/-Android-3DDC84?logo=android&logoColor=white&style=flat-square)](https://play.google.com/store/apps/details?id=host.exp.exponent)  
  - [Expo Go for iOS ![iOS](https://img.shields.io/badge/-iOS-000000?logo=apple&logoColor=white&style=flat-square)](https://apps.apple.com/us/app/expo-go/id982107779)  
- **Optional**  
  - [Android Studio ![Windows](https://img.shields.io/badge/-Windows-0078D6?logo=windows&logoColor=white&style=flat-square) ![macOS](https://img.shields.io/badge/-macOS-000000?logo=apple&logoColor=white&style=flat-square)](https://developer.android.com/studio)   
  - [Xcode (macOS Only) ![macOS](https://img.shields.io/badge/-macOS-000000?logo=apple&logoColor=white&style=flat-square)](https://developer.apple.com/xcode/)

**Recommended VS Code Extensions:**
- [ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)
- [React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)
- [Expo Tools](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools)

### Installation

1. Clone the repo and `cd` into the project directory.  
2. Install dependencies:  
   ```bash
   npm install
   ```  
3. Start Expo:  
   ```bash
   npx expo start
   ```  
4. Choose a launch option: emulator/simulator, dev build, or Expo Go.  
5. Begin development by editing files under the **app/** directory.

[⬆️ Back to Top](#table-of-contents)

---

## Tests

> _No tests configured yet._  

[⬆️ Back to Top](#table-of-contents)

---

## Roadmap

- Registration & development  
- Build & test  
- QA  
- Approvals  
- ASO (App Store Optimization)  
- App submission  
- Release  

[⬆️ Back to Top](#table-of-contents)

---

## Contributing

- Fetch & switch to `main-dev`  
  ```bash
  git fetch && git checkout main-dev && git pull
  ```
- Create your branch based from `main-dev`  
  ```bash
  git checkout -b <your-name>-dev main-dev
  ```
- Work on your feature, then stage & commit  
  ```bash
  git add . && git commit -m "initial commit message"
  ```
- Publish your branch  
  ```bash
  git push -u origin <your-name>-dev
  ```
- Before you push for Pull (Merge) Requests, make sure to always pull the latest changes from `main-dev` while on your branch.
   ```bash
   git pull origin main-dev
   git push -u origin <your-name>-dev
   ```
- Open a PR on GitHub: base is `main-dev`, compare is `<your-name>-dev`

[⬆️ Back to Top](#table-of-contents)

---

## Authors

- **Ralph Cajipe** [![GitHub](https://img.shields.io/badge/-181717?logo=github&style=flat-square)](https://github.com/ralphcajipe) | [![Email](https://img.shields.io/badge/-Email-D14836?logo=gmail&logoColor=white&style=flat-square)](mailto:ralphcajipe@gmail.com)
- **Dhanco Mendoza** [![GitHub](https://img.shields.io/badge/-181717?logo=github&style=flat-square)](https://github.com/dhnxx) | [![Email](https://img.shields.io/badge/-Email-D14836?logo=gmail&logoColor=white&style=flat-square)](mailto:dhancomendoza@gmail.com)
- **Stephen Camilon** [![GitHub](https://img.shields.io/badge/-181717?logo=github&style=flat-square)](https://github.com/Stephencamilon) | [![Email](https://img.shields.io/badge/-Email-D14836?logo=gmail&logoColor=white&style=flat-square)](mailto:stephencamilon267@gmail.com)

[⬆️ Back to Top](#table-of-contents)

---

## Acknowledgments

- _to be updated_

[⬆️ Back to Top](#table-of-contents)

---

## Version History

| Version | Release Date | Description                   | Developers |
| ------- | ------------ | ----------------------------- | ---------- |
| v1.0.0  | 2025-TBA-TBA   | initial release              | name      |

[⬆️ Back to Top](#table-of-contents)