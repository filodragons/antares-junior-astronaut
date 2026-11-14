import { describe, expect, it } from "vitest";
import { applyCrisisChoice, pendingSolCrisis } from "@/lib/sol-crises";
import { INITIAL_RESOURCES } from "@/lib/survival";

const EARLY = ["comms", "dust", "radiation", "waterLeak", "thermal"] as const;

describe("Scheduled Sol crises", () => {
  it("triggers Communication Blackout in Sol 1 once", () => {
    expect(pendingSolCrisis(1, [])).toBe("comms");
    expect(pendingSolCrisis(1, ["comms"])).toBeNull();
  });
  it("triggers Dust Storm in Sol 2 once", () => {
    expect(pendingSolCrisis(2, ["comms"])).toBe("dust");
    expect(pendingSolCrisis(2, ["comms", "dust"])).toBeNull();
  });
  it("triggers Radiation Storm only from Sol 3 and only once", () => {
    expect(pendingSolCrisis(2, ["comms", "dust"])).toBeNull();
    expect(pendingSolCrisis(3, ["comms", "dust"])).toBe("radiation");
    expect(pendingSolCrisis(3, ["comms", "dust", "radiation"])).toBeNull();
  });
  it("triggers Water Recycling Leak only from Sol 4 and only once", () => {
    expect(pendingSolCrisis(3, ["comms", "dust", "radiation"])).toBeNull();
    expect(pendingSolCrisis(4, ["comms", "dust", "radiation"])).toBe("waterLeak");
    expect(pendingSolCrisis(4, ["comms", "dust", "radiation", "waterLeak"])).toBeNull();
  });
  it("triggers Thermal Regulator Malfunction only from Sol 5 and only once", () => {
    expect(pendingSolCrisis(4, ["comms", "dust", "radiation", "waterLeak"])).toBeNull();
    expect(pendingSolCrisis(5, ["comms", "dust", "radiation", "waterLeak"])).toBe("thermal");
    expect(pendingSolCrisis(5, [...EARLY])).toBeNull();
  });
  it("triggers System Telemetry Glitch only from Sol 6 and only once", () => {
    expect(pendingSolCrisis(5, [...EARLY])).toBeNull();
    expect(pendingSolCrisis(6, [...EARLY])).toBe("glitch");
    expect(pendingSolCrisis(6, [...EARLY, "glitch"])).toBeNull();
  });
  it("triggers Power Grid Overload only from Sol 7 and only once", () => {
    expect(pendingSolCrisis(6, [...EARLY, "glitch"])).toBeNull();
    expect(pendingSolCrisis(7, [...EARLY, "glitch"])).toBe("grid");
    expect(pendingSolCrisis(7, [...EARLY, "glitch", "grid"])).toBeNull();
  });
  it("queues overdue crises chronologically", () => {
    expect(pendingSolCrisis(5, ["comms", "dust"])).toBe("radiation");
    expect(pendingSolCrisis(5, ["comms", "dust", "radiation"])).toBe("waterLeak");
    expect(pendingSolCrisis(7, [...EARLY])).toBe("glitch");
    expect(pendingSolCrisis(7, [...EARLY, "glitch"])).toBe("grid");
  });
  it.each([
    ["radiation", "A", { oxygen: 98, water: 98, power: 82, shield: 100 }],
    ["radiation", "B", { oxygen: 96, water: 94, power: 95, shield: 90 }],
    ["waterLeak", "B", { oxygen: 98, water: 95, power: 90, shield: 99 }],
    ["waterLeak", "A", { oxygen: 97, water: 88, power: 96, shield: 98 }],
    ["thermal", "A", { oxygen: 97, water: 97, power: 92, shield: 96 }],
    ["thermal", "B", { oxygen: 99, water: 98, power: 80, shield: 98 }],
    ["glitch", "B", { oxygen: 99, water: 99, power: 88, shield: 99 }],
    ["glitch", "A", { oxygen: 96, water: 97, power: 94, shield: 92 }],
    ["grid", "A", { oxygen: 99, water: 98, power: 90, shield: 98 }],
    ["grid", "B", { oxygen: 99, water: 99, power: 92, shield: 82 }],
  ] as const)("applies %s option %s resource trade-offs", (crisis, choice, expected) => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, crisis, choice)).toEqual(expected);
  });
  it("restores shielding with the heavy magnetic shield without exceeding 100", () => {
    expect(applyCrisisChoice({ ...INITIAL_RESOURCES, shield: 70 }, "radiation", "A").shield).toBe(82);
  });
  it("queues an unanswered Sol 1 crisis before Sol 2", () => {
    expect(pendingSolCrisis(2, [])).toBe("comms");
  });
  it("applies safe local comms reboot costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "comms", "A")).toEqual({ oxygen: 99, water: 99, power: 95, shield: 100 });
  });
  it("applies emergency relay costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "comms", "B")).toEqual({ oxygen: 98, water: 98, power: 85, shield: 97 });
  });
  it("applies automated sweeper costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "B")).toEqual({ oxygen: 98, water: 99, power: 92, shield: 98 });
  });
  it("applies thermal clear costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "A")).toEqual({ oxygen: 95, water: 96, power: 78, shield: 95 });
  });
  it("never makes resources negative", () => {
    expect(applyCrisisChoice({ oxygen: 1, water: 1, power: 1, shield: 1 }, "dust", "B")).toEqual({ oxygen: 0, water: 0, power: 0, shield: 0 });
  });
  it("collapses the grid when max capacity is pushed on a strained grid", () => {
    expect(applyCrisisChoice({ ...INITIAL_RESOURCES, power: 29 }, "grid", "B")).toEqual({ oxygen: 99, water: 99, power: 0, shield: 82 });
  });
  it("holds the grid when max capacity is pushed with enough reserve", () => {
    expect(applyCrisisChoice({ ...INITIAL_RESOURCES, power: 30 }, "grid", "B").power).toBe(22);
  });
  it("never collapses the grid when loads are shed", () => {
    expect(applyCrisisChoice({ ...INITIAL_RESOURCES, power: 29 }, "grid", "A").power).toBe(19);
  });
});

import { dangerBreach as _db, evaluateDecision, tacticalEnding, SOL_CRISES, strategyStrain, type CrisisId } from "@/lib/sol-crises";
describe("danger threshold and tactical ending", () => {
  it("triggers game over at exactly 40%", () => { expect(_db({ oxygen: 80, water: 40, power: 90, shield: 90 })?.resource).toBe("water"); });
  it("is safe at 41%", () => { expect(_db({ oxygen: 41, water: 41, power: 41, shield: 41 })).toBeNull(); });
  it.each(["oxygen", "water", "power", "shield"] as const)("fails when %s reaches 40 or falls below", (resource) => {
    expect(_db({ ...INITIAL_RESOURCES, [resource]: 40 })?.resource).toBe(resource);
    expect(_db({ ...INITIAL_RESOURCES, [resource]: 39.9 })?.resource).toBe(resource);
  });
  it("varies aggressive roles across Sols", () => {
    expect(strategyStrain(SOL_CRISES.comms.choices.A.label)).toBe(0);
    expect(strategyStrain(SOL_CRISES.dust.choices.A.label)).toBe(8);
    expect(strategyStrain(SOL_CRISES.dust.choices.B.label)).toBe(0);
  });
  it("scores identical measured decisions equally regardless of letter", () => {
    expect(evaluateDecision(INITIAL_RESOURCES, "comms", "A").wisdom).toBe(100);
    expect(evaluateDecision(INITIAL_RESOURCES, "dust", "B").wisdom).toBe(100);
  });
  it("changes the preferred water strategy with resource scarcity", () => {
    expect(evaluateDecision(INITIAL_RESOURCES, "waterLeak", "B").wisdom).toBe(100);
    const scarcePower = { ...INITIAL_RESOURCES, power: 51 };
    expect(evaluateDecision(scarcePower, "waterLeak", "A").wisdom).toBe(100);
    expect(evaluateDecision(scarcePower, "waterLeak", "B").wisdom).toBeLessThan(100);
  });
  it("values shielding recovery when shields are strained rather than already full", () => {
    expect(evaluateDecision({ ...INITIAL_RESOURCES, shield: 55 }, "radiation", "B").wisdom).toBeLessThan(evaluateDecision(INITIAL_RESOURCES, "radiation", "B").wisdom);
  });
  it("awards a balanced seven-Sol path regardless of A/B counts", () => {
    const ids = Object.keys(SOL_CRISES) as CrisisId[];
    const decisions = ids.map((id) => {
      const a = evaluateDecision(INITIAL_RESOURCES, id, "A");
      const b = evaluateDecision(INITIAL_RESOURCES, id, "B");
      return a.wisdom >= b.wisdom ? a : b;
    });
    expect(tacticalEnding(decisions).outcome).toBe("win");
    expect(tacticalEnding(decisions).wisdom).toBe(100);
  });
  it("fails a cumulative path of poor tactical trade-offs", () => {
    const decisions = (Object.keys(SOL_CRISES) as CrisisId[]).map((id) => {
      const a = evaluateDecision(INITIAL_RESOURCES, id, "A");
      const b = evaluateDecision(INITIAL_RESOURCES, id, "B");
      return a.wisdom <= b.wisdom ? a : b;
    });
    expect(tacticalEnding(decisions).wisdom).toBeLessThan(70);
    expect(tacticalEnding(decisions).outcome).toBe("fail");
  });
  it("requires all seven unique crises for a balanced ending", () => {
    expect(tacticalEnding(Array.from({ length: 7 }, () => evaluateDecision(INITIAL_RESOURCES, "comms", "A"))).outcome).toBe("fail");
  });
});
