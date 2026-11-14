import { describe, expect, it } from "vitest";
import { applyCrisisChoice, pendingSolCrisis } from "@/lib/sol-crises";
import { INITIAL_RESOURCES } from "@/lib/survival";

describe("Phase 1 Sol crises", () => {
  it("triggers Communication Blackout in Sol 1 once", () => {
    expect(pendingSolCrisis(1, [])).toBe("comms");
    expect(pendingSolCrisis(1, ["comms"])).toBeNull();
  });
  it("triggers Dust Storm in Sol 2 once", () => {
    expect(pendingSolCrisis(2, ["comms"])).toBe("dust");
    expect(pendingSolCrisis(2, ["comms", "dust"])).toBeNull();
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
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "A")).toEqual({ oxygen: 98, water: 99, power: 92, shield: 98 });
  });
  it("applies thermal clear costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "B")).toEqual({ oxygen: 95, water: 96, power: 78, shield: 95 });
  });
  it("never makes resources negative", () => {
    expect(applyCrisisChoice({ oxygen: 1, water: 1, power: 1, shield: 1 }, "dust", "B")).toEqual({ oxygen: 0, water: 0, power: 0, shield: 0 });
  });
});