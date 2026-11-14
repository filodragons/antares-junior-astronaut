export type Resources = { oxygen: number; water: number; power: number; shield: number };
export type Commands = { moxie: boolean; recycler: boolean; solar: boolean; shielding: boolean };
export const INITIAL_RESOURCES: Resources = { oxygen: 100, water: 100, power: 100, shield: 100 };
export const INITIAL_COMMANDS: Commands = { moxie: false, recycler: false, solar: false, shielding: false };

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function advanceResources(resources: Resources, commands: Commands, seconds: number, crisis: boolean): Resources {
  const duration = Math.max(0, seconds);
  const powered = resources.power > 0;
  return {
    oxygen: clamp(resources.oxygen + duration * (commands.moxie && powered ? 0.2 : -0.12)),
    water: clamp(resources.water + duration * (commands.recycler && powered ? 0.15 : -0.08)),
    power: clamp(resources.power + duration * ((commands.solar && !crisis ? 0.4 : 0) - 0.05 - (commands.moxie ? 0.1 : 0) - (commands.recycler ? 0.08 : 0) - (commands.shielding ? 0.08 : 0))),
    shield: clamp(resources.shield + duration * (commands.shielding && powered ? 0.2 : crisis ? -0.25 : -0.04)),
  };
}

export function triggerTestCrisis(resources: Resources): Resources {
  return { ...resources, power: clamp(resources.power - 20) };
}