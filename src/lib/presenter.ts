import { SOL_SECONDS, MISSION_SOLS } from "@/lib/mission";
import { SOL_CRISES, type CrisisId } from "@/lib/sol-crises";
import { INITIAL_RESOURCES } from "@/lib/survival";

export function presenterScenario(sol: number) {
  const selected = Math.max(1, Math.min(MISSION_SOLS, Math.floor(Number.isFinite(sol) ? sol : 3)));
  const ids = Object.keys(SOL_CRISES) as CrisisId[];
  return {
    sol: selected,
    elapsed: (selected - 1) * SOL_SECONDS,
    crisis: ids.find((id) => SOL_CRISES[id].sol === selected) ?? "radiation",
    resolved: ids.filter((id) => SOL_CRISES[id].sol < selected),
    resources: { ...INITIAL_RESOURCES, shield: selected === 3 ? 68 : 90 },
  };
}

export const RADIATION_ENVIRONMENT = [
  { label: "Surface temperature", value: "−63 °C" },
  { label: "Surface pressure", value: "610 Pa" },
  { label: "Radiation condition", value: "Heavy-ion storm" },
  { label: "Crew protocol", value: "Shelter / shielding" },
] as const;
export const DONKI_URL = "https://kauai.ccmc.gsfc.nasa.gov/DONKI/";