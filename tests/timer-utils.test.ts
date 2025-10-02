import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { INGREDIENTS } from "../src/data/ingredients.js";
import type { PrepItem, TimerItem } from "../src/types.js";
import {
  addIngredientToPrepList,
  addTimerFromPrepItem,
  calculatePercent,
  clearDoneTimers,
  completeDueTimers,
  createPrepItem,
  createTimerFromIngredient,
  formatTimeLeft,
  removePrepItem,
  updatePrepItemSeconds,
} from "../src/lib/timer-utils.js";

const SAMPLE_INGREDIENT = INGREDIENTS[0];

describe("formatTimeLeft", () => {
  it("formats seconds under one minute", () => {
    assert.equal(formatTimeLeft(1500), "2s");
  });

  it("formats minutes and pads seconds", () => {
    assert.equal(formatTimeLeft(125000), "2:05");
  });
});

describe("createTimerFromIngredient", () => {
  it("creates a running timer with offset", () => {
    const now = 1_000;
    const timer = createTimerFromIngredient(SAMPLE_INGREDIENT, 30, now);
    assert.equal(timer.startAt, now);
    assert.equal(timer.endAt, now + (SAMPLE_INGREDIENT.seconds + 30) * 1000);
    assert.equal(timer.status, "running");
    assert.equal(timer.totalMs, (SAMPLE_INGREDIENT.seconds + 30) * 1000);
    assert.equal(timer.name, SAMPLE_INGREDIENT.name);
  });
});

describe("calculatePercent", () => {
  it("caps progress between 0 and 100", () => {
    const base: TimerItem = {
      id: "timer",
      name: "Test",
      totalMs: 10_000,
      startAt: 0,
      endAt: 10_000,
      status: "running",
    };

    assert.equal(calculatePercent(base, 5_000), 50);
    assert.equal(calculatePercent(base, -5_000), 0);
    assert.equal(calculatePercent(base, 15_000), 100);
  });
});

describe("completeDueTimers", () => {
  it("marks only overdue running timers as done", () => {
    const timers: TimerItem[] = [
      {
        id: "due",
        name: "Due",
        totalMs: 1000,
        startAt: 0,
        endAt: 500,
        status: "running",
      },
      {
        id: "future",
        name: "Future",
        totalMs: 1000,
        startAt: 0,
        endAt: 5000,
        status: "running",
      },
      {
        id: "done",
        name: "Done",
        totalMs: 1000,
        startAt: 0,
        endAt: 1000,
        status: "done",
      },
    ];

    const { updated, completedIds } = completeDueTimers(timers, 1000);
    assert.deepEqual(completedIds, ["due"]);
    const statuses = updated.map((t: TimerItem) => t.status);
    assert.deepEqual(statuses, ["done", "running", "done"]);
  });
});

describe("prep list helpers", () => {
  it("creates a prep item with fallback emoji", () => {
    const ingredient = { ...SAMPLE_INGREDIENT, emoji: undefined };
    const now = 1234;
    const item = createPrepItem(ingredient, now);
    assert.equal(item.emoji, "🍽️");
    assert.equal(item.id, `prep_${ingredient.id}_${now}`);
  });

  it("adds ingredient only once", () => {
    const first = addIngredientToPrepList([], SAMPLE_INGREDIENT, 1);
    const second = addIngredientToPrepList(first, SAMPLE_INGREDIENT, 2);
    assert.equal(first.length, 1);
    assert.equal(second.length, 1);
    assert.equal(second[0].addedAt, first[0].addedAt);
  });

  it("updates prep seconds with minimum enforcement", () => {
    const [item] = addIngredientToPrepList([], SAMPLE_INGREDIENT, 1);
    const updated = updatePrepItemSeconds([item], item.id, 5, 10);
    assert.equal(updated[0].customSeconds, 10);
  });

  it("removes prep item by id", () => {
    const [item] = addIngredientToPrepList([], SAMPLE_INGREDIENT, 1);
    const remaining = removePrepItem([item], item.id);
    assert.equal(remaining.length, 0);
  });
});

describe("addTimerFromPrepItem", () => {
  it("adds timer with custom seconds at front of list", () => {
    const [prepItem] = addIngredientToPrepList([], SAMPLE_INGREDIENT, 1);
    const custom: PrepItem = { ...prepItem, customSeconds: prepItem.seconds + 30 };
    const lookup = new Map(INGREDIENTS.map((ing: typeof INGREDIENTS[number]) => [ing.id, ing]));
    const timers: TimerItem[] = [
      {
        id: "existing",
        name: "Existing",
        totalMs: 1000,
        startAt: 0,
        endAt: 1000,
        status: "running",
      },
    ];

    const result = addTimerFromPrepItem(timers, custom, lookup, 1000);
    assert.equal(result.length, 2);
    const [first] = result;
    assert.equal(first.startAt, 1000);
    assert.equal(first.totalMs, (prepItem.seconds + 30) * 1000);
    assert.equal(first.name, SAMPLE_INGREDIENT.name);
  });

  it("ignores prep items without matching ingredient", () => {
    const prepItem: PrepItem = {
      id: "prep_missing",
      ingredientId: "missing",
      name: "Ghost",
      emoji: "👻",
      seconds: 60,
      addedAt: 0,
    };
    const timers = addTimerFromPrepItem([], prepItem, new Map());
    assert.equal(timers.length, 0);
  });
});

describe("clearDoneTimers", () => {
  it("filters completed timers", () => {
    const timers: TimerItem[] = [
      { id: "a", name: "A", totalMs: 1000, startAt: 0, endAt: 1000, status: "running" },
      { id: "b", name: "B", totalMs: 1000, startAt: 0, endAt: 1000, status: "done" },
    ];
    const remaining = clearDoneTimers(timers);
    assert.deepEqual(remaining.map((t: TimerItem) => t.id), ["a"]);
  });
});
