import type { Ingredient } from "@/data/ingredients";
import type { PrepItem, TimerItem } from "@/types";

export function formatTimeLeft(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, "0")}` : `${r}s`;
}

export function createTimerFromIngredient(
  ing: Ingredient,
  offsetSec = 0,
  now: number = Date.now(),
): TimerItem {
  const totalMs = Math.max(0, (ing.seconds + offsetSec) * 1000);
  return {
    id: `${ing.id}_${now}`,
    name: ing.name,
    emoji: ing.emoji,
    totalMs,
    startAt: now,
    endAt: now + totalMs,
    status: "running",
  };
}

export function calculatePercent(timer: TimerItem, now: number = Date.now()): number {
  const total = timer.totalMs;
  const passed = Math.min(total, Math.max(0, now - timer.startAt));
  return total === 0 ? 100 : Math.round((passed / total) * 100);
}

export function completeDueTimers(
  timers: TimerItem[],
  now: number = Date.now(),
): { updated: TimerItem[]; completedIds: string[] } {
  const completedIds: string[] = [];
  const updated = timers.map((timer) => {
    if (timer.status === "running" && timer.endAt <= now) {
      completedIds.push(timer.id);
      return { ...timer, status: "done" as const };
    }
    return timer;
  });
  return { updated, completedIds };
}

export function createPrepItem(
  ingredient: Ingredient,
  now: number = Date.now(),
): PrepItem {
  return {
    id: `prep_${ingredient.id}_${now}`,
    ingredientId: ingredient.id,
    name: ingredient.name,
    emoji: ingredient.emoji || "🍽️",
    seconds: ingredient.seconds,
    addedAt: now,
  };
}

export function addIngredientToPrepList(
  prepList: PrepItem[],
  ingredient: Ingredient,
  now: number = Date.now(),
): PrepItem[] {
  if (prepList.some((item) => item.ingredientId === ingredient.id)) {
    return prepList;
  }
  const newItem = createPrepItem(ingredient, now);
  return [newItem, ...prepList];
}

export function updatePrepItemSeconds(
  prepList: PrepItem[],
  id: string,
  customSeconds: number,
  minimumSeconds = 15,
): PrepItem[] {
  const seconds = Math.max(minimumSeconds, customSeconds);
  return prepList.map((item) =>
    item.id === id
      ? {
          ...item,
          customSeconds: seconds,
        }
      : item,
  );
}

export function removePrepItem(prepList: PrepItem[], id: string): PrepItem[] {
  return prepList.filter((item) => item.id !== id);
}

export function clearDoneTimers(timers: TimerItem[]): TimerItem[] {
  return timers.filter((timer) => timer.status !== "done");
}

export function addTimerFromPrepItem(
  timers: TimerItem[],
  prepItem: PrepItem,
  ingredientLookup: Map<string, Ingredient>,
  now: number = Date.now(),
): TimerItem[] {
  // 处理自定义食材
  if (prepItem.isCustom) {
    const customSeconds = prepItem.customSeconds ?? prepItem.seconds;
    const timer: TimerItem = {
      id: `custom_${now}_${Math.random().toString(36).substr(2, 9)}`,
      name: prepItem.name,
      emoji: prepItem.emoji,
      totalMs: customSeconds * 1000,
      startAt: now,
      endAt: now + (customSeconds * 1000),
      status: "running",
    };
    return [timer, ...timers];
  }
  
  // 处理普通食材
  const ingredient = ingredientLookup.get(prepItem.ingredientId);
  if (!ingredient) return timers;
  
  const customSeconds = prepItem.customSeconds ?? prepItem.seconds;
  const timer = createTimerFromIngredient({ ...ingredient, seconds: customSeconds }, 0, now);
  return [timer, ...timers];
}
