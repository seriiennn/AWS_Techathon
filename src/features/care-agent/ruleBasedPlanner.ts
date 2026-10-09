import { ADVICE_LIBRARY } from '../../data/adviceLibrary';
import type { CareAction, CarePlan, HabitSurvey, UsageRecord, VisionTestResult } from '../../types';

const makeAction = (template: keyof typeof ADVICE_LIBRARY, observation: string, target: string): CareAction => ({
  actionId: crypto.randomUUID(), observation, target, acceptedByUser: false, completionStatus: 'not-started', ...ADVICE_LIBRARY[template],
});

export const createRuleBasedPlan = (input: { vision?: VisionTestResult; usage?: UsageRecord; habits?: HabitSurvey; goal?: string; }): CarePlan => {
  const missingData: string[] = [];
  if (!input.usage) missingData.push('No screen-use record was provided.');
  if (!input.habits) missingData.push('No eye-comfort questionnaire was provided.');
  if (!input.vision) missingData.push('No experimental E-task result was available.');
  const symptoms = input.habits?.symptoms ?? [];
  const urgent = symptoms.includes('persistent-blur');
  if (urgent) return { id: crypto.randomUUID(), generatedAt: new Date().toISOString(), mode: 'rule-based', missingData, urgentNotice: 'You reported persistent blur. VisionWell cannot assess its cause; consider timely professional eye-health advice instead of relying on this prototype plan.', actions: [makeAction('professional', 'You reported persistent blur in the questionnaire.', 'Choose an appropriate time to seek professional advice if this symptom is ongoing or concerning.') ] };

  const actions: CareAction[] = [];
  const frequent = input.habits?.continuousScreenUse === 'often' || (input.usage?.longestContinuousMinutes ?? 0) >= 60;
  if (frequent) actions.push(makeAction('breaks', input.usage?.longestContinuousMinutes ? `You recorded a longest continuous screen session of ${input.usage.longestContinuousMinutes} minutes.` : 'You indicated that you often use a screen continuously for a long time.', input.goal || 'Use one short distance break during each 20-minute study block for seven days.'));
  if (symptoms.includes('dryness') || symptoms.includes('fatigue')) actions.push(makeAction('comfort', `You reported ${symptoms.join(' and ')} today.`, 'Use a brief blink-and-focus pause during two screen sessions each day.'));
  if (input.habits?.glareOrReadingDifficulty) actions.push(makeAction('glare', 'You reported glare or reading difficulty.', 'Make one display or lighting adjustment before your next long reading task.'));
  if (input.usage && input.usage.entertainmentMinutes && input.usage.entertainmentMinutes >= 120) actions.push(makeAction('screen-goal', `You recorded ${input.usage.entertainmentMinutes} minutes of optional entertainment use (${input.usage.source} data).`, input.goal || 'Choose a voluntary 15-minute reduction in one entertainment-screen session this week.'));
  if (!actions.length) actions.push(makeAction('breaks', 'No specific discomfort or long-session pattern was provided.', 'Try one 20-20-20 distance break on three study days this week.'));
  return { id: crypto.randomUUID(), generatedAt: new Date().toISOString(), mode: 'rule-based', missingData, actions: actions.slice(0, 3) };
};
