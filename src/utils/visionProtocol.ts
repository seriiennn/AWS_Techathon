import { calculateOptotypeCssPx, calculateOptotypeSizeMm, isDisplayResolutionSufficient } from '../lib/calibration';
import type { Direction, ExperimentalLevel, TrialAnswer, VisionTrial } from '../types';

export const TEST_PROTOCOL_VERSION = 'visionwell-e-binocular-v5-ascent-fallback';
export const OPTOTYPE_VERSION = 'svg-tumbling-e-5x5-v1';

// These labels are experimental UI levels only. They are not clinical visual-acuity values.
// 5.0 is the reference angular size; each +0.1 reduces angular size by about 10^-0.1.
const experimentalScale = (level: number) => 10 ** (5 - level);
export const EXPERIMENTAL_LEVELS: ExperimentalLevel[] = [4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3]
  .map((value) => ({ id: `experimental-${value.toFixed(1)}`, scale: experimentalScale(value), label: `Experimental ${value.toFixed(1)}` }));
export const STARTING_LEVEL_INDEX = EXPERIMENTAL_LEVELS.findIndex((level) => level.id === 'experimental-4.5');

export const angleArcminutes = (sizeMm: number, distanceMm: number) => 2 * Math.atan(sizeMm / (2 * distanceMm)) * (180 / Math.PI) * 60;
export const getTrialGeometry = (distanceCm: number, scale: number, pxPerMm: number) => {
  const optotypeSizeMm = calculateOptotypeSizeMm(distanceCm, 13.8 * scale);
  const optotypeCssPx = calculateOptotypeCssPx(optotypeSizeMm, pxPerMm);
  return { optotypeSizeMm, optotypeCssPx, angleArcminutes: angleArcminutes(optotypeSizeMm, distanceCm * 10), displaySufficient: isDisplayResolutionSufficient(optotypeCssPx) };
};
export const makeTrial = (input: { level: ExperimentalLevel; distanceCm: number; distanceSource: 'camera' | 'manual'; pxPerMm: number; direction: Direction; }): VisionTrial => {
  const geometry = getTrialGeometry(input.distanceCm, input.level.scale, input.pxPerMm);
  return { id: crypto.randomUUID(), timestamp: new Date().toISOString(), levelId: input.level.id, levelScale: input.level.scale, angleArcminutes: geometry.angleArcminutes, distanceCm: input.distanceCm, distanceSource: input.distanceSource, optotypeSizeMm: geometry.optotypeSizeMm, optotypeCssPx: geometry.optotypeCssPx, direction: input.direction, answer: null, correct: null, valid: true };
};
export const resolveTrial = (trial: VisionTrial, answer: TrialAnswer, reactionTimeMs: number): VisionTrial => ({ ...trial, answer, correct: answer !== 'unsure' && answer === trial.direction, reactionTimeMs });
