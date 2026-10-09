# VisionWell technical steering

Use React, TypeScript, Vite, browser WebRTC, MediaPipe Face Landmarker, SVG, and localStorage. Keep geometry, scoring, camera-quality logic, history comparison, and planner rules as deterministic modules independent of components. All physical calculations use mm; physical display size requires card calibration, never a fixed CSS-mm conversion. Keep model/WASM assets local in production. Camera data stays in-browser. Never expose API keys in frontend code; the default planner is explicitly rule-based.
