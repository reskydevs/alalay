# 🤖 AI Assistant Mobile Device Guide (palp)

This project uses `palp` to let AI coding assistants (**Google Antigravity**, **Claude Code**, **OpenAI Codex**) navigate and test mobile screens safely and autonomously.

## 🚀 Common Commands for AI Agents

1. **Tap Buttons by Visible Text or Accessibility Label:**
   ```bash
   palp tap-text "Log In"
   palp tap-text "Continue"
   palp tap-text "Settings"
   ```

2. **Take Clean Screenshots (Status Bar & Gesture Bar Automatically Removed):**
   ```bash
   palp snap preview.png
   ```

3. **Type into Active Fields:**
   ```bash
   palp type "test_user@example.com"
   ```

4. **Navigate Screen Hierarchy:**
   ```bash
   palp press back
   palp press home
   palp press enter
   ```

5. **Tap Relative Screen Positions:**
   ```bash
   palp tap 0.5,0.5      # Center of screen
   palp tap 0.5,0.2      # Top header
   ```

6. **Swipe Gestures (Carousels & Scrolling):**
   ```bash
   palp swipe left       # Next slide / scroll right
   palp swipe right      # Previous slide / scroll left
   palp swipe up         # Scroll down
   palp swipe down       # Scroll up
   ```
