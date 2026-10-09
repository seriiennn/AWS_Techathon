import type { CalibrationSample, DistanceModel } from '../types';

export const REFERENCE_DISTANCE_MM = 3000;
export const REFERENCE_OPTOTYPE_MM = 13.8;
export const CARD_WIDTH_MM = 85.6;
export const MIN_STROKE_CSS_PX = 1.5;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const calculateOptotypeSizeMm = (
  viewingDistanceCm: number,
  referenceOptotypeMm = REFERENCE_OPTOTYPE_MM,
) => referenceOptotypeMm * ((viewingDistanceCm * 10) / REFERENCE_DISTANCE_MM);

export const calculateOptotypeCssPx = (sizeMm: number, cssPixelsPerMm: number) =>
  sizeMm * cssPixelsPerMm;

export const isDisplayResolutionSufficient = (optotypeCssPx: number) =>
  optotypeCssPx / 5 >= MIN_STROKE_CSS_PX;

export const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

export const standardDeviation = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
};

export const fitDistanceModel = (samples: CalibrationSample[]): DistanceModel | null => {
  if (samples.length < 2) return null;
  const points = samples.map((sample) => ({ x: 1 / sample.eyePixelDistance, y: sample.distanceCm }));
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (denominator === 0) return null;
  const slope = points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator;
  const intercept = meanY - slope * meanX;
  const total = points.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0);
  const residual = points.reduce((sum, point) => sum + (point.y - (slope * point.x + intercept)) ** 2, 0);
  return { slope, intercept, rSquared: total === 0 ? 1 : 1 - residual / total };
};

export const estimateDistanceFromModel = (model: DistanceModel, eyePixelDistance: number) =>
  model.slope * (1 / eyePixelDistance) + model.intercept;

export const calculateIpdFocalLengthPx = (samples: CalibrationSample[], ipdMm: number) => {
  if (!samples.length || ipdMm <= 0) return null;
  return samples.reduce(
    (sum, sample) => sum + (sample.eyePixelDistance * sample.distanceCm * 10) / ipdMm,
    0,
  ) / samples.length;
};

export const estimateDistanceFromIpd = (focalLengthPx: number, ipdMm: number, eyePixelDistance: number) =>
  (focalLengthPx * ipdMm / eyePixelDistance) / 10;
