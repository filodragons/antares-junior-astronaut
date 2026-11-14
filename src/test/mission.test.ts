import { describe, expect, it } from "vitest";
import { missionClock } from "@/lib/mission";

describe("Martian mission clock", () => {
  it("completes one Sol at exactly one minute", () => {
    expect(missionClock(59).completed).toBe(0);
    expect(missionClock(60)).toEqual({ completed: 1, currentSol: 2, remaining: 60, finished: false });
  });
  it("finishes the mission after seven Sols", () => {
    expect(missionClock(419).finished).toBe(false);
    expect(missionClock(420)).toEqual({ completed: 7, currentSol: 7, remaining: 0, finished: true });
    expect(missionClock(900).completed).toBe(7);
  });
});