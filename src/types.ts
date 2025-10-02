export type TimerStatus = "running" | "paused" | "done";

export interface TimerItem {
  id: string;
  name: string;
  emoji?: string;
  totalMs: number;
  startAt: number;
  endAt: number;
  status: TimerStatus;
  pausedLeftMs?: number;
  note?: string;
}

export interface PrepItem {
  id: string;
  ingredientId: string;
  name: string;
  emoji: string;
  seconds: number;
  customSeconds?: number;
  addedAt: number;
}
