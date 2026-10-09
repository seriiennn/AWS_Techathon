export type Direction = 'up' | 'right' | 'down' | 'left';
export type TrialAnswer = Direction | 'unsure';
export type UserMode = 'camera' | 'manual';
export type AppStage = 'welcome' | 'setup' | 'calibration' | 'dashboard' | 'testing' | 'colour' | 'usage' | 'plan' | 'results';
export type TrackingStatus = 'idle' | 'loading' | 'ready' | 'no-face' | 'reposition' | 'moving' | 'stable' | 'error';
export type TestSupervisorState = 'calibrationRequired' | 'tracking' | 'stabilising' | 'presenting' | 'paused' | 'completed' | 'displayLimited';
export type TrialInvalidReason = 'tracking-lost' | 'unsuitable-pose' | 'rapid-movement' | 'distance-shift' | 'display-limited' | 'manual-distance-changed';
export type MeasurementQuality = 'not-measured' | 'manual-reported' | 'limited' | 'stable-camera' | 'display-limited';
export type HistoryComparability = 'Comparable' | 'Limited comparability' | 'Not comparable';

export interface CalibrationSample { distanceCm: number; eyePixelDistance: number; }
export interface DistanceModel { slope: number; intercept: number; rSquared: number; }
export interface ScreenCalibration { calibrationId: string; cssPixelsPerMm: number; devicePixelRatio: number; viewportSize: string; completedAt: string; }
export interface TrackerReading { status: TrackingStatus; message: string; eyePixelDistance: number | null; estimatedDistanceCm: number | null; rawDistanceCm: number | null; speedCmPerSecond: number | null; rollDegrees: number | null; yawAsymmetry: number | null; }

export interface ExperimentalLevel { id: string; scale: number; label: string; }
export interface VisionTrial { id: string; timestamp: string; levelId: string; levelScale: number; angleArcminutes: number; distanceCm: number; distanceSource: UserMode; optotypeSizeMm: number; optotypeCssPx: number; direction: Direction; answer: TrialAnswer | null; correct: boolean | null; valid: boolean; invalidReason?: TrialInvalidReason; reactionTimeMs?: number; }
export interface VisionTestResult { protocolVersion: string; binocularMode: true; levelsAttempted: string[]; trials: VisionTrial[]; validTrials: number; correctResponses: number; accuracy: number | null; smallestPassedLevel?: ExperimentalLevel; measurementQuality: MeasurementQuality; terminationReason: string; displayLimited: boolean; }

export interface ColourPlate { id: string; kind: 'control' | 'experimental'; prompt: string; expectedAnswer: string; seed: number; hueA: string; hueB: string; }
export interface ColourResponse { plateId: string; answer: string; correct: boolean; uncertain: boolean; }
export interface ColourResult { displayConditionsConfirmed: boolean; responses: ColourResponse[]; controlsPassed: boolean; completed: boolean; }

export interface UsageRecord { id: string; date: string; unit: 'single-day' | 'daily-average' | 'period-total'; totalMinutes: number; entertainmentMinutes?: number; longestContinuousMinutes?: number; breakFrequency?: string; source: 'manual' | 'simulated'; }
export interface HabitSurvey { correctionStatus?: 'glasses-or-contacts' | 'none' | 'prefer-not-to-say'; symptoms?: Array<'dryness' | 'fatigue' | 'persistent-blur'>; continuousScreenUse?: 'often' | 'sometimes' | 'rarely'; glareOrReadingDifficulty?: boolean; goal?: string; }

export interface CareAction { actionId: string; title: string; observation: string; suggestion: string; rationale: string; limitation: string; sourceLabel: string; sourceUrl: string; target: string; reminderPreference: 'none' | 'browser-timer' | 'calendar-download'; acceptedByUser: boolean; completionStatus: 'not-started' | 'in-progress' | 'completed'; }
export interface CarePlan { id: string; generatedAt: string; mode: 'rule-based'; missingData: string[]; urgentNotice?: string; actions: CareAction[]; }

export interface VisionHistoryRecord { sessionId: string; timestamp: string; testProtocolVersion: string; optotypeVersion: string; calibrationId?: string; displayProfile?: string; viewingDistanceRange?: [number, number]; correctionStatus?: HabitSurvey['correctionStatus']; binocularMode: true; responseStatistics: Pick<VisionTestResult, 'validTrials' | 'correctResponses' | 'accuracy'>; measurementQuality: MeasurementQuality; terminationReason: string; dataSource: UserMode; displayLimited: boolean; }
export interface HistoryComparison { status: HistoryComparability; reasons: string[]; }
