import type { Resources } from "@/lib/survival";

export type CrisisId = "comms" | "dust";
export type ChoiceId = "A" | "B";
export const SOL_CRISES = {
  comms: {
    sol: 1,
    title: "Communication Blackout",
    warning: "Earth link lost. The colony is operating without contact with mission support. Restore communications.",
    choices: {
      A: { label: "Reboot Local Comms safely", delta: { oxygen: -1, water: -1, power: -5, shield: 0 } },
      B: { label: "Use emergency backup relay", delta: { oxygen: -2, water: -2, power: -15, shield: -3 } },
    },
  },
  dust: {
    sol: 2,
    title: "Dust Storm",
    warning: "Solar panels blocked by Martian dust. Power generation is offline. Clear the arrays before reserves run low.",
    choices: {
      A: { label: "Deploy slow automated sweepers", delta: { oxygen: -2, water: -1, power: -8, shield: -2 } },
      B: { label: "Manual high-power thermal clear", delta: { oxygen: -5, water: -4, power: -22, shield: -5 } },
    },
  },
} as const;

export function pendingSolCrisis(currentSol: number, resolved: CrisisId[]): CrisisId | null {
  if (currentSol >= 1 && !resolved.includes("comms")) return "comms";
  if (currentSol >= 2 && !resolved.includes("dust")) return "dust";
  return null;
}

export function applyCrisisChoice(resources: Resources, crisis: CrisisId, choice: ChoiceId): Resources {
  const delta = SOL_CRISES[crisis].choices[choice].delta;
  return {
    oxygen: Math.min(100, Math.max(0, resources.oxygen + delta.oxygen)),
    water: Math.min(100, Math.max(0, resources.water + delta.water)),
    power: Math.min(100, Math.max(0, resources.power + delta.power)),
    shield: Math.min(100, Math.max(0, resources.shield + delta.shield)),
  };
}