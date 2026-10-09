# VisionWell Agent — Design

## Architecture

```text
React UI
 ├─ features/calibration      physical-card calibration and display profile
 ├─ features/distance         camera feature spans, filtering, distance status
 ├─ features/vision-test      supervisor state machine, trial scoring, SVG E
 ├─ features/color-test       original fixed-seed experimental colour plates
 ├─ features/screen-time      manual records and simulated seven-day data
 ├─ features/care-agent       deterministic evidence-to-action planner
 └─ features/dashboard        local session history, comparison and export

Pure modules: geometric calculation, task scoring, advice selection, history comparison
Browser services: WebRTC/MediaPipe, localStorage, download export
```

## Data flow
1. The screen-calibration feature stores physical `pxPerMm`, viewport, DPR, timestamp, and a calibration ID.
2. The distance feature emits landmark quality and a smoothed Estimated Distance. It preserves raw distance for quality checks.
3. The supervisor receives a `MeasurementSnapshot` and owns all trial validity, response locking, level transitions, and display-limit stops.
4. Colour, usage, and habit features return typed optional records. Missing information remains missing.
5. The planner accepts typed evidence and chooses from local advice rules. The user accepts, edits, or rejects actions.
6. Consent-aware persistence saves only structured session/history data; video and raw screenshots are excluded.

## UI principles
- Desktop-first, clean health-technology dashboard: Slate background (`#F8FAFC`), navy text (`#0F172A`), blue accent (`#2563EB`), and text plus icon/state labels—not colour alone.
- Demo Mode exposes the geometric data panel and smooth resizing so the angular-size concept is visible.
- Test Mode removes answers and live sizing details from the target area. It disables CSS target transitions while collecting a response.
- Every medical-sounding output uses experimental/educational language and links the measurement condition or limitation beside it.
- The Activity Panel logs only actual state events such as calibration checked, tracking paused, level passed, usage record confirmed, and plan accepted.

## Measurement and rendering model
All calculations use mm until the final calibrated CSS conversion.

```text
D_user_mm = estimatedDistanceCm × 10
S_user_mm = 13.80 × levelScale × D_user_mm / 3000
angle_arcmin = 2 × atan(S_user_mm / (2 × D_user_mm)) × 180 / π × 60
size_css_px = S_user_mm × pxPerMm
stroke_device_px = size_css_px / 5 × devicePixelRatio
```

The display-limited condition is `stroke_device_px < 2`. It limits rendering, not the user’s ability.

## Local asset plan
The production implementation should serve MediaPipe WASM and the fixed Face Landmarker model from `/public/models/`. No webcam frame is transmitted. If local assets cannot load, the UI presents an actionable error and Manual Demo remains complete.

## Safety and comparison model
A history record has protocol/version, optotype version, calibration/display profile, binocular and correction metadata, valid response statistics, quality, stop reason, and source. The comparison function returns a classification with reasons; it does not create a trend claim. The care planner presents health education sources and limitations rather than diagnoses or causal statements.
