import { describe, expect, it } from "vitest";
import { presenterScenario } from "@/lib/presenter";
import { pendingSolCrisis, dangerBreach } from "@/lib/sol-crises";
import { missionClock } from "@/lib/mission";

describe("Presenter scenarios", () => {
  it("jumps directly to Sol 3 radiation, without overdue crises or drain", () => {
    const scenario = presenterScenario(3);
    expect(scenario.elapsed).toBe(120);
    expect(scenario.crisis).toBe("radiation");
    expect(scenario.resolved).toEqual(["comms", "dust"]);
    expect(scenario.resources).toEqual({ oxygen: 100, water: 100, power: 100, shield: 68 });
    expect(pendingSolCrisis(3, scenario.resolved)).toBe("radiation");
    expect(dangerBreach(scenario.resources)).toBeNull();
  });
  it.each([1, 2, 3, 4, 5, 6, 7])("opens the specific crisis at Sol %i", (sol) => {
    const scenario = presenterScenario(sol);
    expect(missionClock(scenario.elapsed).currentSol).toBe(sol);
    expect(pendingSolCrisis(sol, scenario.resolved)).toBe(scenario.crisis);
  });
  it("clamps jumps to the seven-Sol mission", () => {
    expect(presenterScenario(0).sol).toBe(1);
    expect(presenterScenario(8).sol).toBe(7);
  });
  it("returns isolated reserves so demo choices cannot mutate the next scenario", () => {
    const first = presenterScenario(3);
    first.resources.power = 0;
    expect(presenterScenario(3).resources.power).toBe(100);
  });
});