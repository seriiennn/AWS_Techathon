import type { CarePlan, UsageRecord, VisionHistoryRecord } from '../types';

const KEYS = { history: 'visionwell-history-v1', plans: 'visionwell-plans-v1', usage: 'visionwell-usage-v1' } as const;
const read = <T,>(key: string): T[] => { try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; } catch { return []; } };
const write = <T,>(key: string, value: T[]) => localStorage.setItem(key, JSON.stringify(value));
export const localStore = {
  history: () => read<VisionHistoryRecord>(KEYS.history),
  plans: () => read<CarePlan>(KEYS.plans),
  usage: () => read<UsageRecord>(KEYS.usage),
  saveHistory: (record: VisionHistoryRecord) => write(KEYS.history, [record, ...read<VisionHistoryRecord>(KEYS.history)]),
  savePlan: (plan: CarePlan) => write(KEYS.plans, [plan, ...read<CarePlan>(KEYS.plans)]),
  saveUsage: (record: UsageRecord) => write(KEYS.usage, [record, ...read<UsageRecord>(KEYS.usage)]),
  removeHistory: (sessionId: string) => write(KEYS.history, read<VisionHistoryRecord>(KEYS.history).filter((item) => item.sessionId !== sessionId)),
  clearAll: () => Object.values(KEYS).forEach((key) => localStorage.removeItem(key)),
  exportAll: () => ({ exportedAt: new Date().toISOString(), history: read<VisionHistoryRecord>(KEYS.history), plans: read<CarePlan>(KEYS.plans), usage: read<UsageRecord>(KEYS.usage) }),
};
