export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface FaceObservation {
  eyePixelDistance: number;
  rollDegrees: number;
  yawAsymmetry: number;
  usable: boolean;
  message: string;
}

const LEFT_EYE = [33, 133, 159, 145];
const RIGHT_EYE = [362, 263, 386, 374];
const NOSE = 1;

const averagePoint = (landmarks: Landmark[], indices: number[], width: number, height: number) => {
  const points = indices.map((index) => landmarks[index]);
  return {
    x: (points.reduce((sum, point) => sum + point.x, 0) / points.length) * width,
    y: (points.reduce((sum, point) => sum + point.y, 0) / points.length) * height,
  };
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const inspectFace = (
  landmarks: Landmark[] | undefined,
  videoWidth: number,
  videoHeight: number,
): FaceObservation | null => {
  if (!landmarks || landmarks.length < 400 || !videoWidth || !videoHeight) return null;
  const leftEye = averagePoint(landmarks, LEFT_EYE, videoWidth, videoHeight);
  const rightEye = averagePoint(landmarks, RIGHT_EYE, videoWidth, videoHeight);
  const noseRaw = landmarks[NOSE];
  if (!noseRaw) return null;
  const nose = { x: noseRaw.x * videoWidth, y: noseRaw.y * videoHeight };
  const eyePixelDistance = distance(leftEye, rightEye);
  const rollDegrees = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);
  const leftNoseDistance = distance(leftEye, nose);
  const rightNoseDistance = distance(rightEye, nose);
  const yawAsymmetry = Math.abs(leftNoseDistance - rightNoseDistance) / (leftNoseDistance + rightNoseDistance);

  if (eyePixelDistance < 36) {
    return { eyePixelDistance, rollDegrees, yawAsymmetry, usable: false, message: 'Move a little closer so both eyes are clearly visible.' };
  }
  if (Math.abs(rollDegrees) > 8 || yawAsymmetry > 0.2) {
    return { eyePixelDistance, rollDegrees, yawAsymmetry, usable: false, message: 'Please face the screen and keep your head level.' };
  }
  return { eyePixelDistance, rollDegrees, yawAsymmetry, usable: true, message: 'Face position is suitable for measurement.' };
};
