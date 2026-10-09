# VisionWell Agent — Feature Requirements

## Product statement
VisionWell Agent is a browser-local, health-education prototype for university students and adult screen users. It demonstrates distance-adaptive Tumbling E tasks and turns self-reported habits into a user-approved eye-care action plan. It supports **SDG 3: Good Health and Well-being**.

> **Prototype boundary:** VisionWell records experimental binocular task performance. It is not a clinical visual-acuity, refractive-error, colour-vision, or eye-disease diagnostic tool. Equivalent angular geometry does not make a near test clinically equivalent to a three-metre examination.

## MVP flow
1. Welcome: choose Camera Test or Manual Demo.
2. Display calibration: match an 85.60 mm physical card and store `pxPerMm`.
3. Distance setup: run camera calibration at known distance or set a user-reported 30–300 cm manual distance.
4. Adaptive E task: answer Tumbling E opening direction using keyboard or buttons.
5. Optional Colour Vision Exploration: complete original, fixed-seed experimental colour plates.
6. Optional usage and habit record: add manual daily data or load the clearly marked simulated seven-day dataset.
7. Rule-based VisionWell Agent: inspect available data, report missing data, and propose up to three editable actions.
8. Dashboard: view the current session, consented local history, comparison limitations, and accepted plan.

## Measurement requirements
- Internal distance and physical size calculations use millimetres.
- `S_user = S_ref × levelScale × D_user / D_ref`, where `D_ref = 3000 mm` and `S_ref = 13.80 mm`.
- Required checks: 300 cm → 13.80 mm, 100 cm → 4.60 mm, 50 cm → 2.30 mm, 30 cm → 1.38 mm at level scale 1.0.
- Display conversion is `optotypeCssPx = optotypeSizeMm × pxPerMm`; CSS reference millimetres are never used as physical calibration.
- The SVG E has a fixed 5×5 grid, black fill, white background, 1/5-stroke geometry, and opening mapping Right 0°, Down 90°, Left 180°, Up 270°.
- A target is display-limited when its stroke is below the configured prototype minimum of two device pixels. It must not be silently enlarged.
- Camera landmarks are processed locally. Feature spans use raw video coordinates, never preview-container size or landmark `z` as millimetres.
- Camera estimates are labelled **Estimated Distance**. Calibration, camera position relative to screen, pose, autofocus, and face-feature variation remain error sources.

## Test-supervisor requirements
- Test states: `calibrationRequired`, `tracking`, `stabilising`, `presenting`, `paused`, `completed`, `displayLimited`.
- A valid camera trial begins only after a configurable one-second stable window; distance deviation beyond 5% invalidates a presented trial.
- Loss of tracking, unsuitable pose, fast motion, or display limitation pauses/hides the target and logs a real invalid reason. Invalid trials do not count as errors.
- Manual mode is explicitly user-reported/simulated and cannot claim camera-verified stability.
- Experimental levels use `[2.0, 1.6, 1.25, 1.0, 0.8, 0.63, 0.5]`. Each level allows up to five valid responses; four correct pass. An unreachable four-of-five result ends the level early.
- Results never convert experimental performance to prescription, clinical acuity, disease status, or a vision-improvement claim.

## Colour exploration requirements
- Plates are original, deterministic SVG material labelled **Experimental / Unvalidated**; no Ishihara material is copied.
- Two control plates validate task understanding; four experimental plates are optional.
- If a control plate is not identified, the task ends with a display/task-understanding message—not a colour-vision conclusion.
- Results report completion, expected-pattern recognition, uncertain answers, user-confirmed display conditions, and material status only.

## Usage, questionnaire, history, and privacy
- Manual screen-use entry requires a date and a declared unit (single day, daily average, or period total). Optional fields never get inferred.
- Simulated data is visibly labelled and stored separately from user records. The web app does not claim to sync iOS or Android device statistics.
- Screenshots/OCR are deferred in this MVP; users have manual and simulated alternatives. No unsupported phone connection is shown.
- Habit questions can be skipped. The agent names missing fields rather than inventing answers.
- Camera frames and original screenshots are not stored or uploaded. Browser storage is opt-in for history and accepted plans. Users can export structured JSON or delete individual/all local records.
- Session comparison checks protocol, display calibration, binocular/correction status, viewing conditions, sufficient valid trials, and display limitation. It reports Comparable, Limited comparability, or Not comparable; it never claims medical decline.

## Agent requirements
- The default **Rule-based Prototype Agent** uses deterministic state and a local advice library; it does not pretend to call an LLM.
- It selects at most three suggestions and attaches Observation, Suggestion, Rationale, Limitation, and Source to each.
- The agent cannot diagnose illness, attribute performance to screen time, promise acuity improvement, prescribe medications/supplements, or create unsupported treatment.
- Self-reported sudden visual change or significant eye pain supersedes habit planning and shows a fixed prompt to seek timely professional assessment. This is not a diagnosis.
- The user may edit targets and accept or reject each action before a plan is saved.

## Acceptance criteria
The project must install, build, and present a complete camera or manual demonstration. It must preserve the 50 cm = 2.30 mm calculation, pause invalid trials, provide no-camera functionality, separate colour exploration from E-task results, label simulated data, and run its plan generator without a server, external API, or API key.
