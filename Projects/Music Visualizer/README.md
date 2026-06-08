# Music Visualizer

A real-time audio visualizer built with vanilla HTML5, CSS3, JavaScript, the Web Audio API, and the HTML5 Canvas 2D API.

## Features

- **Local Audio File Ingestion** — Load MP3, WAV, or OGG via file picker. Uses `URL.createObjectURL` to route directly into a hidden `<audio>` element — zero network requests.
- **Web Audio API Pipeline** — `AudioContext` → `MediaElementAudioSourceNode` → `AnalyserNode` (FFT 256, smoothing 0.8) → `ctx.destination`. Initialized on first user interaction to satisfy autoplay policies.
- **60fps Canvas Render Loop** — `requestAnimationFrame` drives `analyser.getByteFrequencyData(dataArray)` per frame. Two visualization modes:
  - **Linear Bar Spectrograph** — Vertical frequency rods with dynamic height and color gradient (cyan → hot pink).
  - **Radial Bass Ring Pulse** — Concentric ring that scales thickness, radius, and bloom based on low-end sub-bass energy, with spectrum bars orbiting around it.
- **Audio Context Guard** — Checks for `context.state === 'suspended'` and calls `.resume()` on click/spacebar to comply with browser autoplay policies.
- **Sensitivity Slider** — Adjusts the amplitude multiplier (0.5× – 2.5×) for both visual modes.
- **Synthwave Dark Aesthetic** — `#03050a` background, glassmorphic control overlay, neon cyan/hot-pink spectrum colors, monospace typography.

## Run it

Open `index.html` in any modern browser. Load an audio file and press play.
