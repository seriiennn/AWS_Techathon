# VisionWell Agent — Delivery Tasks

## P0 — Geometry and manual demonstration
- [x] Calibrate physical display with an 85.60 mm card reference.
- [x] Implement mm-first size calculation and display-limit guard.
- [x] Render SVG Tumbling E with four opening directions.
- [x] Provide manual 30–300 cm demonstration with live distance, mm, CSS px, and angular size.
- [x] Validate production build.

## P1 — Experimental tasks and deterministic agent
- [ ] Add Test Supervisor state machine and five-attempt experimental level rule.
- [ ] Improve camera calibration, pose/tracking failure handling, and invalid-trial logging.
- [ ] Add original fixed-seed Color Vision Exploration controls and experimental plates.
- [ ] Add manual screen-use record, habit questionnaire, and simulated seven-day dataset.
- [ ] Add Rule-based Prototype Agent with editable, accept/reject care-plan actions.

## P2 — Local records and comparison
- [ ] Add consent-aware session/history persistence.
- [ ] Add comparison classification with explanatory limitations.
- [ ] Add JSON export and per-record/all-record deletion.
- [ ] Add dashboard views for current session, colour task, usage source, history, and accepted plan.
- [ ] Add optional local-only screenshot/OCR pipeline after manual flow is stable.

## P3 — Demo polish and optional services
- [ ] Bundle fixed MediaPipe model and WASM under public assets.
- [ ] Add accessible motion polish and an activity log driven by real events.
- [ ] Add optional server-proxied LLM wording only after deterministic plan safety is reviewed.
- [ ] Rehearse the two-minute demo script on Camera and Manual fallback paths.

## Validation checklist
- [x] `npm install` and `npm run build` work.
- [x] 50 cm maps to 2.30 mm at the 13.80 mm / 300 cm reference.
- [ ] Camera loss pauses a trial without counting an error.
- [ ] Repeated input cannot submit an answer twice.
- [ ] Display limit stops further shrinking and is reported.
- [ ] Simulated data and real records remain separated.
- [ ] No diagnostic, prescription, or causal language appears in results or plan.
