import { describe, expect, it } from "vitest";
import { advanceResources, missionOutcome, INITIAL_COMMANDS, INITIAL_RESOURCES, triggerTestCrisis } from "@/lib/survival";

describe("Command deck", () => {
  it("MOXIE generates oxygen while drawing power", () => {
    const result = advanceResources({ ...INITIAL_RESOURCES, oxygen: 50 }, { ...INITIAL_COMMANDS, moxie: true }, 10, false);
    expect(result.oxygen).toBe(52);
    expect(result.power).toBe(98.5);
  });
  it("water recycling restores water", () => {
    expect(advanceResources({ ...INITIAL_RESOURCES, water: 50 }, { ...INITIAL_COMMANDS, recycler: true }, 10, false).water).toBe(51.5);
  });
  it("solar arrays recharge power but cannot recharge during a dust storm", () => {
    const resources = { ...INITIAL_RESOURCES, power: 50 };
    expect(advanceResources(resources, { ...INITIAL_COMMANDS, solar: true }, 10, false).power).toBe(53.5);
    expect(advanceResources(resources, { ...INITIAL_COMMANDS, solar: true }, 10, true).power).toBe(49.5);
  });
  it("active shielding restores shield integrity", () => {
    expect(advanceResources({ ...INITIAL_RESOURCES, shield: 50 }, { ...INITIAL_COMMANDS, shielding: true }, 10, false).shield).toBe(52);
  });
  it("judge test instantly reduces power without changing other resources", () => {
    expect(triggerTestCrisis(INITIAL_RESOURCES)).toEqual({ oxygen: 100, water: 100, power: 80, shield: 100 });
  });
  it("resources stay between zero and one hundred", () => {
    expect(advanceResources(INITIAL_RESOURCES, INITIAL_COMMANDS, 10000, true)).toEqual({ oxygen: 0, water: 0, power: 0, shield: 0 });
    expect(advanceResources(INITIAL_RESOURCES, { moxie: true, recycler: true, solar: true, shielding: true }, 10000, false)).toEqual(INITIAL_RESOURCES);
  });
});

describe("Seven-Sol endings", () => {
  it("does not end the mission before seven Sols", () => {
    expect(missionOutcome(6, INITIAL_RESOURCES, false)).toBeNull();
    expect(missionOutcome(6, { ...INITIAL_RESOURCES, power: 0 }, true)).toBeNull();
  });
  it("wins after seven Sols when every resource stayed online", () => {
    expect(missionOutcome(7, { oxygen: 1, water: 1, power: 1, shield: 1 }, false)).toBe("win");
  });
  it.each(["oxygen", "water", "power", "shield"] as const)("fails after seven Sols if %s is depleted", (key) => {
    expect(missionOutcome(7, { ...INITIAL_RESOURCES, [key]: 0 }, false)).toBe("fail");
  });
  it("fails if a resource was depleted earlier even if later recovered", () => {
    expect(missionOutcome(7, INITIAL_RESOURCES, true)).toBe("fail");
  });
});