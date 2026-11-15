import type { Resources } from "@/lib/survival";

export type CrisisId = "comms" | "dust" | "radiation" | "waterLeak" | "thermal" | "glitch" | "grid";
export type ChoiceId = "A" | "B";
export const SOL_CRISES = {
  comms: {
    sol: 1,
    title: "Communication Blackout",
    warning: "Earth link lost. The colony is operating without contact with mission support. Restore communications.",
    choices: {
      A: { label: "Reboot Local Comms safely", delta: { oxygen: -1, water: -1, power: -5, shield: 0 }, risk: null },
      B: { label: "Use emergency backup relay", delta: { oxygen: -2, water: -2, power: -15, shield: -3 }, risk: null },
    },
  },
  dust: {
    sol: 2,
    title: "Dust Storm",
    warning: "Solar panels blocked by Martian dust. Power generation is offline. Clear the arrays before reserves run low.",
    choices: {
      A: { label: "Manual high-power thermal clear", delta: { oxygen: -5, water: -4, power: -22, shield: -5 }, risk: null },
      B: { label: "Deploy slow automated sweepers", delta: { oxygen: -2, water: -1, power: -8, shield: -2 }, risk: null },
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
      A: { label: "Deploy heavy magnetic shielding", delta: { oxygen: -2, water: -2, power: -18, shield: 12 }, risk: null },
      B: { label: "Fast pharmacological countermeasure", delta: { oxygen: -4, water: -6, power: -5, shield: -10 }, risk: null },
    },
  },
  waterLeak: {
    sol: 4,
    title: "Water Recycling Leak",
    warning: "A breach in the recycling loop is causing critical water loss. Secure the supply before the colony's reserves run dry.",
    choices: {
      A: { label: "Reroute secondary graywater reserves", delta: { oxygen: -3, water: -12, power: -4, shield: -2 }, risk: null },
      B: { label: "Isolate and seal primary pipe", delta: { oxygen: -2, water: -5, power: -10, shield: -1 }, risk: null },
    },
  },
  thermal: {
    sol: 5,
    title: "Thermal Regulator Malfunction",
    warning: "The habitat's thermal regulator has failed. Freezing temperatures threaten crew safety and life-support equipment. Restore heat immediately.",
    choices: {
      A: { label: "Reset thermal core gradually", delta: { oxygen: -3, water: -3, power: -8, shield: -4 }, risk: null },
      B: { label: "Overclock backup heaters", delta: { oxygen: -1, water: -2, power: -20, shield: -2 }, risk: null },
    },
  },
  glitch: {
    sol: 6,
    title: "System Telemetry Glitch",
    warning: "Sensor arrays are reporting false warnings across the habitat. Telemetry cannot be trusted — verify the data before the crew acts on phantom alarms.",
    choices: {
      A: { label: "Hard-reset mainframe systems", delta: { oxygen: -4, water: -3, power: -6, shield: -8 }, risk: null },
      B: { label: "Run deep diagnostic scan", delta: { oxygen: -1, water: -1, power: -12, shield: -1 }, risk: null },
    },
  },
  grid: {
    sol: 7,
    title: "Power Grid Overload",
    warning: "Final endurance test: the grid is at its limit and every system is drawing at once. Hold the load through Sol 7 without collapsing the grid.",
    choices: {
      A: { label: "Reroute and shed non-essential loads", delta: { oxygen: -1, water: -2, power: -10, shield: -2 }, risk: null },
      B: {
        label: "Push grid to maximum capacity (Risky failure)",
        delta: { oxygen: -1, water: -1, power: -8, shield: -18 },
        risk: { resource: "power", threshold: 30, note: "Risky · Power below 30 collapses the grid" },
      },
    },
  },
} as const;

export function pendingSolCrisis(currentSol: number, resolved: CrisisId[]): CrisisId | null {
  return (Object.keys(SOL_CRISES) as CrisisId[])
    .find((id) => currentSol >= SOL_CRISES[id].sol && !resolved.includes(id)) ?? null;
}

export function applyCrisisChoice(resources: Resources, crisis: CrisisId, choice: ChoiceId): Resources {
  const { delta, risk } = SOL_CRISES[crisis].choices[choice];
  const next: Resources = {
    oxygen: Math.min(100, Math.max(0, resources.oxygen + delta.oxygen)),
    water: Math.min(100, Math.max(0, resources.water + delta.water)),
    power: Math.min(100, Math.max(0, resources.power + delta.power)),
    shield: Math.min(100, Math.max(0, resources.shield + delta.shield)),
  };
  if (risk !== null && resources[risk.resource] < risk.threshold) next[risk.resource] = 0;
  return next;
}

export const DANGER_THRESHOLD = 40;
const RESOURCE_LABELS: Record<keyof Resources, string> = { oxygen: "Oxygen (MOXIE)", water: "Water", power: "Power", shield: "Radiation Shield" };

/** First resource at or below the 40% danger threshold, with a failure reason. */
export function dangerBreach(resources: Resources): { resource: keyof Resources; reason: string } | null {
  const key = (Object.keys(resources) as (keyof Resources)[]).find((k) => resources[k] <= DANGER_THRESHOLD);
  if (!key) return null;
  return { resource: key, reason: `${RESOURCE_LABELS[key]} fell to ${Math.round(resources[key])}% — at or below the ${DANGER_THRESHOLD}% danger threshold.` };
}

export type DecisionRecord = { crisis: CrisisId; strategy: string; before: Resources; after: Resources; wisdom: number };
export const BALANCED_WISDOM = 50;

/** Content, not button position, defines the strain imposed on habitat systems. */
export function strategyStrain(label: string): number {
  return /emergency|high-power|pharmacological|graywater|Overclock|Hard-reset|maximum capacity/i.test(label) ? 8 : 0;
}

export function choiceApproach(crisis: CrisisId, choice: ChoiceId): string {
  return strategyStrain(SOL_CRISES[crisis].choices[choice].label) > 0 ? "Rapid intervention · Higher system strain" : "Measured intervention · Lower system strain";
}

/** Scarce reserves carry more weight; restoration helps only up to capacity. */
function strategicUtility(before: Resources, after: Resources, label: string): number {
  if (dangerBreach(after)) return -1000;
  return (Object.keys(before) as (keyof Resources)[]).reduce((total, key) => {
    const scarcity = 60 / Math.max(5, before[key] - DANGER_THRESHOLD);
    return total + (after[key] - before[key]) * scarcity;
  }, -strategyStrain(label));
}

export function evaluateDecision(before: Resources, crisis: CrisisId, choice: ChoiceId): DecisionRecord {
  const selected = SOL_CRISES[crisis].choices[choice];
  const after = applyCrisisChoice(before, crisis, choice);
  const utility = strategicUtility(before, after, selected.label);
  const best = Math.max(...(["A", "B"] as const).map((id) => strategicUtility(before, applyCrisisChoice(before, crisis, id), SOL_CRISES[crisis].choices[id].label)));
  return { crisis, strategy: selected.label, before: { ...before }, after, wisdom: Math.max(0, Math.round(100 - 3 * (best - utility))) };
}

export function tacticalEnding(decisions: DecisionRecord[]): { outcome: "win" | "fail"; wisdom: number; weakest: DecisionRecord | null } {
  const wisdom = decisions.length ? Math.round(decisions.reduce((sum, record) => sum + record.wisdom, 0) / decisions.length) : 0;
  const complete = new Set(decisions.map((record) => record.crisis)).size === Object.keys(SOL_CRISES).length;
  const weakest = decisions.reduce<DecisionRecord | null>((lowest, record) => lowest === null || record.wisdom < lowest.wisdom ? record : lowest, null);
  return { outcome: complete && wisdom > BALANCED_WISDOM ? "win" : "fail", wisdom, weakest };
}
