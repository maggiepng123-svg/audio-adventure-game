# Audio Adventure

An accessible, audio-first adventure game designed for visually impaired players.

## Features
- keyboard-only controls
- audio narration using browser speech synthesis
- sound cues with the Web Audio API
- room-based exploration
- inventory and puzzle progression
- browser-based gameplay across desktop and mobile browsers

## How to run
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Open the local URL printed in the terminal in your browser.

## Controls
- W / A / S / D or Arrow keys: move
- L: look around
- I: inventory
- H: help
- T: take item
- U: use item
- Q: quit

## Accessibility notes
- The game uses aria-live regions for announcements.
- Speech output is provided through the browser's speech synthesis API.
- Audio cues are layered in to make actions understandable without visual feedback.
- The interface is designed for keyboard interaction and screen readers.

## Future improvements
- Add more rooms and stories
- Add soundscapes for each location
- Add difficulty settings
- Package for desktop with Electron
- Add mobile wrappers with Capacitor
