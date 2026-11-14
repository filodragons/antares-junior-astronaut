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
    ["waterLeak", "A", { oxygen: 98, water: 95, power: 90, shield: 99 }],
    ["waterLeak", "B", { oxygen: 97, water: 88, power: 96, shield: 98 }],
    ["thermal", "A", { oxygen: 97, water: 97, power: 92, shield: 96 }],
    ["thermal", "B", { oxygen: 99, water: 98, power: 80, shield: 98 }],
    ["glitch", "A", { oxygen: 99, water: 99, power: 88, shield: 99 }],
    ["glitch", "B", { oxygen: 96, water: 97, power: 94, shield: 92 }],
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
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "A")).toEqual({ oxygen: 98, water: 99, power: 92, shield: 98 });
  });
  it("applies thermal clear costs", () => {
    expect(applyCrisisChoice(INITIAL_RESOURCES, "dust", "B")).toEqual({ oxygen: 95, water: 96, power: 78, shield: 95 });
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
