import type { HistoryComparison, VisionHistoryRecord } from '../../types';

export const compareHistory = (current: VisionHistoryRecord, previous?: VisionHistoryRecord): HistoryComparison => {
  if (!previous) return { status: 'Not comparable', reasons: ['No previous locally saved session is available.'] };
  const blockers: string[] = [];
  const limits: string[] = [];
  if (current.testProtocolVersion !== previous.testProtocolVersion) blockers.push('The test protocol version differs.');
  if (current.binocularMode !== previous.binocularMode) blockers.push('The binocular testing mode differs.');
  if (current.correctionStatus !== previous.correctionStatus) blockers.push('Reported correction status differs.');
  if (!current.calibrationId || !previous.calibrationId) limits.push('One or both sessions lack confirmed physical display calibration.');
  if (current.displayProfile !== previous.displayProfile) limits.push('Display conditions may differ.');
  if (current.displayLimited || previous.displayLimited) limits.push('One or both sessions were display-limited.');
  if (current.responseStatistics.validTrials < 5 || previous.responseStatistics.validTrials < 5) limits.push('One or both sessions have limited valid trials.');
  if (blockers.length) return { status: 'Not comparable', reasons: blockers.concat(limits) };
  if (limits.length) return { status: 'Limited comparability', reasons: limits };
  return { status: 'Comparable', reasons: ['Protocol, binocular mode, correction status, calibration, and basic display conditions match. Experimental differences are not medical trends.'] };
};
