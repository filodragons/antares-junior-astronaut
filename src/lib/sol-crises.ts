import type { Resources } from "@/lib/survival";

export type CrisisId = "comms" | "dust" | "radiation" | "waterLeak" | "thermal";
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
  radiation: {
    sol: 3,
    title: "Radiation Storm",
    warning: "Heavy-ion radiation is exceeding the colony's safe thresholds, risking cellular stress and DNA damage. Protect the crew immediately.",
    scienceLog: {
      url: "https://osdr.nasa.gov/bio/repo/data/studies/OSD-1010",
      text: "NASA OSDR Study OSD-1010 studied human intestinal cells in a gut-on-chip exposed to silicon-28 and iron-56 heavy ions. At 50 cGy, irradiation activated inflammatory signaling, DNA damage pathways, p53 signaling, and cell-cycle checkpoints. The study also examined how Lacticaseibacillus rhamnosus GG modulated these responses. Colony safety thresholds and both countermeasures here are fictional game scenarios, not validated astronaut treatments.",
    },
    choices: {
      A: { label: "Deploy heavy magnetic shielding", delta: { oxygen: -2, water: -2, power: -18, shield: 12 } },
      B: { label: "Fast pharmacological countermeasure", delta: { oxygen: -4, water: -6, power: -5, shield: -10 } },
    },
  },
  waterLeak: {
    sol: 4,
    title: "Water Recycling Leak",
    warning: "A breach in the recycling loop is causing critical water loss. Secure the supply before the colony's reserves run dry.",
    choices: {
      A: { label: "Isolate and seal primary pipe", delta: { oxygen: -2, water: -5, power: -10, shield: -1 } },
      B: { label: "Reroute secondary graywater reserves", delta: { oxygen: -3, water: -12, power: -4, shield: -2 } },
    },
  },
  thermal: {
    sol: 5,
    title: "Thermal Regulator Malfunction",
    warning: "The habitat's thermal regulator has failed. Freezing temperatures threaten crew safety and life-support equipment. Restore heat immediately.",
    choices: {
      A: { label: "Reset thermal core gradually", delta: { oxygen: -3, water: -3, power: -8, shield: -4 } },
      B: { label: "Overclock backup heaters", delta: { oxygen: -1, water: -2, power: -20, shield: -2 } },
    },
  },
} as const;

export function pendingSolCrisis(currentSol: number, resolved: CrisisId[]): CrisisId | null {
  return (Object.keys(SOL_CRISES) as CrisisId[])
    .find((id) => currentSol >= SOL_CRISES[id].sol && !resolved.includes(id)) ?? null;
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