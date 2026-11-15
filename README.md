# VisionWell

### Adaptive vision tasks and personalised eye-care planning

**Let the chart adapt to the user.**

VisionWell is a browser-based health-education prototype that combines camera-assisted distance estimation, an adaptive Tumbling E task, experimental colour exploration, voluntary screen-use records, and a transparent rule-based care planner. It turns an interactive demonstration of viewing geometry into a complete journey: calibrate, complete a task, add context, review suggestions, and choose an action plan.

Built for the **BUild Agentic AI Hackathon powered by AWS**, Hong Kong Baptist University, October 2026. Our team received the **Most Innovative Idea Award**. The project focuses on **SDG 3 — Good Health and Well-being**, with university students and adult screen users as its initial audience.

**[Live demo](https://visionwell-prototype.vercel.app/)** · **[Source code](https://github.com/seriiennn/AWS_Techathon)**

> VisionWell is an educational and experimental prototype. It has not been clinically validated and does not diagnose eye conditions, determine a prescription, or replace a professional vision examination. Its experimental levels are not clinical visual-acuity values.

## Why we built it

Conventional vision charts use a fixed target size and viewing distance. Our hackathon question was: **could a website adapt the target to the person, rather than requiring the person to fit a fixed setup?**

VisionWell explores this through physical screen calibration and user-specific camera calibration. As estimated viewing distance changes, the application changes the rendered target size to preserve its intended angular size. A manual-distance mode makes the same principle easy to demonstrate without camera access.

The original project prompt then expanded this interaction into a broader product: optional colour exploration, screen-use context, and an agent-style workflow that explains its observations and proposes actions the user can edit and accept. The current implementation uses deterministic rules and a curated advice library; it does not call an LLM.

## What the prototype does

| Feature | Current implementation |
| --- | --- |
| Physical display calibration | Match an on-screen rectangle to the width of a real 85.60 mm reference card, then calculate CSS pixels per millimetre. |
| Camera-assisted distance estimation | Detect facial landmarks with MediaPipe, capture known-distance anchors at 30, 50 and 80 cm, and fit a user-specific inverse-feature-span model. |
| Adaptive target preview | Resize an SVG Tumbling E with viewing distance and show distance, physical size, CSS size, angular size and display limits. |
| Experimental E task | Randomise four opening directions, adapt difficulty, record valid/invalid trials and pause when tracking or distance conditions become unsuitable. |
| Multiple answer methods | On-screen direction buttons, keyboard arrow keys, a “Cannot identify” response, and optional browser speech recognition. |
| Colour Vision Exploration | Ten original, fixed-seed colour-dot illustrations: two control plates and eight experimental plates. These are not validated Ishihara plates or a diagnostic colour-vision test. |
| Screen-use and comfort context | Manual time entry, optional self-reported discomfort and goals, or a clearly labelled simulated daily-average example. Sections can be skipped. |
| Rule-based care planner | Select up to three relevant actions from a local education library. Show observations, suggestions, rationale, limitations and source links; let users edit targets and accept actions. |
| Local dashboard | Summarise the session, accepted actions and saved history; provide preliminary metadata-based history comparability checks. |
| Exports and local records | Download an HTML session report or saved structured JSON; save session history locally and delete individual history records or all stored records. |
| In-app help | A browser-local, keyword-based assistant explains calibration, voice answers, colour exploration and report generation. |

## User journey

```mermaid
flowchart LR
    A[Welcome] --> B[Camera setup or Manual Demo]
    B --> C[Physical screen calibration]
    C --> D[Camera distance anchors or manual distance]
    D --> E[Adaptive target preview]
    E --> F[Experimental E task]
    F --> G[Optional colour exploration]
    G --> H[Optional screen-use and comfort records]
    H --> I[Rule-based action plan]
    I --> J[User edits and accepts actions]
    J --> K[Dashboard, local history and exports]
```

The manual path is a first-class demonstration route. It is labelled as simulated or user-reported distance and is not presented as camera-verified measurement. Optional sections can be skipped when the user has no information to provide.

## How it works

### 1. Screen calibration and angular scaling

Browser CSS units alone do not establish the physical size of a target on a particular display. The user adjusts a reference rectangle against a real card, producing:

```text
cssPixelsPerMm = referenceCardWidthCssPx / 85.60

targetSizeMm = referenceTargetSizeMm × viewingDistanceMm / referenceDistanceMm
targetSizeCssPx = targetSizeMm × cssPixelsPerMm
```

The prototype reference is **13.80 mm at 3000 mm**. At a viewing distance of **500 mm**, the reference-level target is therefore **2.30 mm**. Experimental levels apply an additional scale factor before rendering.

The application also computes angular size with:

```text
angleRadians = 2 × atan(targetSizeMm / (2 × viewingDistanceMm))
angleArcminutes = angleRadians × 180 / π × 60
```

Maintaining angular size is a geometric property. It does not establish equivalence between a near-screen task and a clinical distance-vision examination. Screen changes or browser zoom changes require recalibration.

Implementation: [`src/lib/calibration.ts`](src/lib/calibration.ts), [`src/components/ScreenCalibration.tsx`](src/components/ScreenCalibration.tsx), [`src/components/TumblingE.tsx`](src/components/TumblingE.tsx).

### 2. Calibrated camera tracking

The browser obtains camera frames through `getUserMedia`. MediaPipe Face Landmarker identifies facial landmarks, and the distance module calculates eye-region feature spans in the original video pixel coordinates.

The current camera workflow captures three user-measured anchors at **30, 50 and 80 cm**. It fits a linear model against inverse eye-feature span:

```text
estimatedDistanceCm = slope × (1 / eyeFeatureSpanPixels) + intercept
```

The tracker checks for a missing face, insufficient feature size, unsuitable head pose and rapid motion. It smooths usable distance estimates before updating the interface. These are prototype quality controls, not a validated guarantee of physical accuracy. Camera geometry, lighting, user calibration and head movement affect the estimate.

Demo mode animates target resizing. During the E task, resizing transitions are disabled; a tracking failure or a distance change exceeding the configured trial tolerance invalidates the trial and pauses presentation. Invalid trials do not count as wrong answers. The user resumes with a new random direction at the same level.

Implementation: [`src/hooks/useCameraTracker.ts`](src/hooks/useCameraTracker.ts), [`src/lib/distance.ts`](src/lib/distance.ts), [`src/App.tsx`](src/App.tsx).

### 3. Experimental task protocol

The current protocol is `visionwell-e-binocular-v5-ascent-fallback`. It differs from the earlier multi-response-per-level idea in the planning prompt:

1. Begin at experimental level **4.5**, within configured levels **4.3–5.3**.
2. A correct answer advances to the next smaller target.
3. The first incorrect or “Cannot identify” answer starts fallback verification at a larger target.
4. In fallback, an incorrect answer moves to a still larger target. The first correct answer locks the experimental result.
5. Reaching the smallest configured target, exhausting fallback targets, or reaching a display limit ends the relevant path.

The result reports accuracy, valid and invalid trial counts, the locked experimental level when available, measurement quality and the termination reason. The level numbers are experimental interface labels, not prescriptions or validated acuity scores. The task is binocular in the current version.

Display checks currently require at least **1.5 CSS pixels per target stroke** and **2 estimated device pixels per stroke**. If the target cannot be rendered within these prototype limits, the app reports a display limitation rather than silently enlarging it.

Implementation: [`src/utils/visionProtocol.ts`](src/utils/visionProtocol.ts), [`src/App.tsx`](src/App.tsx).

### 4. Transparent agent workflow

The product separates two responsibilities:

- **Test supervision:** deterministic state transitions manage calibration, presentation, pausing, invalid trials, completion and display limits.
- **Care planning:** local rules inspect the available experimental result, user-entered screen-use context, comfort questionnaire and personal goal. Relevant actions are selected from a structured advice library.

Each proposed action includes an observation, a suggestion, a rationale, a limitation and an education-source link. Users can change a seven-day target and choose whether to accept it. Missing information is listed explicitly. The helper chat uses keyword-based replies for product guidance.

There is **no LLM API, RAG pipeline, remote model planner or autonomous tool-calling backend** in this version. Kiro was used as a development tool; that is separate from the application's runtime agent implementation.

Implementation: [`src/features/care-agent/ruleBasedPlanner.ts`](src/features/care-agent/ruleBasedPlanner.ts), [`src/data/adviceLibrary.ts`](src/data/adviceLibrary.ts), [`src/components/CarePlanPanel.tsx`](src/components/CarePlanPanel.tsx), [`src/components/Chatbot.tsx`](src/components/Chatbot.tsx).

## Technology stack

| Layer | Technology | Role |
| --- | --- | --- |
| Interface | React **18.3.1**, React DOM **18.3.1** | Component-based user interface, local state and interactive task flow. |
| Language | TypeScript **5.6.3** | Typed calibration data, trials, results, usage records and care plans. |
| Build tooling | Vite **5.4.11**, React plugin **4.3.4** | Development server and production bundling. |
| Computer vision | `@mediapipe/tasks-vision` **0.10.14** | Browser-side Face Landmarker inference using WASM/GPU support. |
| Camera | Browser Media Capture / `getUserMedia` | Permission-based camera stream and local video processing. |
| Voice input | Browser Web Speech API | Optional speech-to-direction answers; the current recognition language is `zh-HK`. |
| Rendering and styling | SVG and custom CSS | Size-controlled Tumbling E, colour illustrations, layouts and visual feedback. Tailwind is not a dependency in the current build. |
| Persistence and downloads | `localStorage`, Blob and object URLs | Browser-local structured records, JSON export and HTML report downloads. |
| Hosting | Vercel | Hosts the linked public prototype. |
| Development process | Kiro, feature specifications and steering documents | Requirements, design, task planning and implementation constraints. |

The hackathon was powered by AWS; the current runtime does not require an AWS account, AWS service configuration, a backend database or an LLM API key.

## Run locally

Use a maintained Node.js LTS release compatible with Vite 5, such as Node.js 22 LTS, and npm. A desktop Chrome browser is the primary demonstration target.

```bash
git clone https://github.com/seriiennn/AWS_Techathon.git
cd AWS_Techathon
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Camera access requires a secure context such as `localhost` or HTTPS. Allow camera access only when using Camera Test; microphone access is optional for speech answers.

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

The build script runs `tsc -b` followed by `vite build`, with output in `dist/`. No environment variables or API credentials are required for the current implementation. Run `npm ci` to install from the lockfile rather than relying on checked-in dependencies.

### Network requirements

Although camera inference runs in the browser, the current tracker downloads WASM resources from jsDelivr and the face model from Google-hosted MediaPipe assets. **The camera path is not fully offline.** Optional speech recognition may also depend on a browser or cloud speech service.

Once the application is loaded, the manual-distance flow and rule-based planner provide a fallback without those camera-model or speech services. Fully offline distribution would require bundling the model/WASM assets and testing the complete workflow without network access.

## Suggested demonstration

1. Open **Manual Demo** and complete the card-width calibration.
2. Move the distance slider between 50 and 100 cm. Show that physical target size doubles while the intended angle remains constant.
3. Start the E task. Demonstrate direction buttons or arrow keys and the ascending/fallback interaction. Voice can be shown separately in a supported browser.
4. Continue to Colour Vision Exploration, or skip it for a shorter presentation.
5. Enter a voluntary screen-use record or load the labelled simulated example.
6. Explain one rule-based recommendation, edit its target and accept it.
7. Open the session overview and generate an HTML report. Optionally save a session locally and demonstrate JSON export.

For a camera demonstration, start Camera Test, allow access and capture the three measured distance anchors. Show the adaptive preview, then move or turn away during a trial to demonstrate invalidation and pause/resume behaviour. Keep Manual Demo available if permissions, model downloads or tracking fail.

## Project structure

```text
.kiro/steering/                  Product, technical and structure constraints
docs/                           requirements.md, design.md and tasks.md
src/
  App.tsx                       User journey, supervisor, scoring and reports
  components/
    CameraPreview.tsx           Camera controls and tracking feedback
    ScreenCalibration.tsx       Physical card-width calibration
    TumblingE.tsx               SVG directional target
    ColourVisionTask.tsx        Optional colour task flow
    ExperimentalColourPlate.tsx Original reproducible colour illustrations
    UsageAndHabits.tsx          Manual/simulated context and questionnaire
    CarePlanPanel.tsx           Editable proposals and user acceptance
    Chatbot.tsx                 Local product-help responses
  hooks/
    useCameraTracker.ts         Camera access, landmarks and distance estimates
    useVoiceAnswer.ts           Optional browser speech input
  lib/
    calibration.ts             Screen scale, target geometry and distance model
    distance.ts                Landmark features and pose checks
  features/
    care-agent/ruleBasedPlanner.ts
    dashboard/history.ts       Preliminary history comparability rules
  data/
    adviceLibrary.ts           Structured education suggestions with sources
    colourPlates.ts            Original control/experimental plate definitions
  utils/
    visionProtocol.ts          Experimental levels and trial helpers
    localStore.ts              Browser-local storage and export
  types.ts                      Shared domain types
  styles.css                    Custom visual design
```

See [requirements](docs/requirements.md), [design](docs/design.md) and [tasks](docs/tasks.md) for the original development specifications. Those documents contain intended behaviour; this README describes the current implementation and separates unfinished ideas below.

## Data handling and prototype boundaries

- The application processes camera frames in the browser. The application code does not upload or persist camera frames.
- Model/WASM downloads are network requests to external asset hosts. Optional speech recognition is provided by the browser and may use an external service; it is not described as guaranteed local or offline processing.
- Screen calibration metadata and submitted manual usage records are written to `localStorage`. Session history and accepted plans are saved through the dashboard's explicit local-save action. This is browser storage, not an encrypted account or cloud-synchronised record.
- The simulated usage example is labelled as simulated. Its “7-day pattern” is currently represented by one daily-average record, not seven separate daily measurements.
- History comparison uses basic protocol, binocular-mode, correction-status, calibration, display and trial-count metadata. It is preliminary and does not establish a reliable medical trend or fully verify matching viewing conditions.
- Original colour illustrations are unvalidated and may provide recognition cues other than colour. They cannot classify colour-vision deficiency.
- Speech answers currently use simple transcript matching. Ambiguous utterances, recognition latency and rapid repeated inputs need more robust handling before this could be used beyond a demonstration.
- The website does not access phone-wide Screen Time/Digital Wellbeing records, diagnose causes of discomfort, or infer that screen use caused a change in task performance.

## Further development

The original prompt included several extensions that remain future work:

- Screenshot import with local OCR, field confirmation and manual correction.
- Native-platform integrations for screen-use data, subject to platform permissions and constraints.
- A server-proxied LLM explanation layer that works only from approved structured inputs, with the local rule-based planner as fallback.
- Stronger trial-state and voice handling, including trial-ID binding, ambiguous-answer rejection and stable-window validation.
- More complete history comparability checks and stronger separation of demonstration data from personal records.
- Bundled MediaPipe assets for reproducible offline camera demonstrations.
- Reminder/timer and calendar-export functionality; current reminder-preference fields do not constitute an implemented reminder service.
- Automated tests for geometry, protocol transitions, invalid-trial handling and data operations, plus accessibility and cross-browser verification.

There is currently no dedicated automated test or lint script in `package.json`. Manual checks should include calibration, the 50 cm → 2.30 mm reference calculation, permission failure fallback, invalid trials, display limits, optional-section skipping, action editing and report/data exports.

## Team and acknowledgements

VisionWell is a team hackathon prototype. Thanks to HKBU and the BUild Agentic AI Hackathon powered by AWS for the opportunity to build and demonstrate it, and to the open-source projects used in the implementation. Kiro specifications and steering files preserve the project's product and technical constraints.

The local advice library links to education resources from the American Optometric Association, American Academy of Ophthalmology, World Health Organization and National Eye Institute. Those organisations did not validate or endorse this prototype.

No project licence has been specified in this repository. Third-party dependencies remain subject to their respective licences.
