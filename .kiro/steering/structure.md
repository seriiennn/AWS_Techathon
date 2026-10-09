# VisionWell structure steering

Organise new work by feature: `src/features/calibration`, `distance`, `vision-test`, `color-test`, `screen-time`, `care-agent`, and `dashboard`; shared schemas live in `src/types`, fixed materials in `src/data`, and pure helpers in `src/utils`. Components should consume feature interfaces rather than own scoring or geometry. Keep persistence behind a local storage service so real and demo records use separate keys.
