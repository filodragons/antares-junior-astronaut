import { AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SOL_CRISES, choiceApproach, type CrisisId, type ChoiceId } from "@/lib/sol-crises";
import { DONKI_URL, RADIATION_ENVIRONMENT } from "@/lib/presenter";

export function SolCrisisAlert({ crisis, onChoose, presenter = false }: { crisis: CrisisId; onChoose: (choice: ChoiceId) => void; presenter?: boolean }) {
  const event = SOL_CRISES[crisis];
  return <div role="alert" aria-label={event.title} className="crisis-warning mx-auto mb-5 w-full max-w-2xl rounded-md border border-destructive/40 bg-background/95 p-5 shadow-[var(--mission-shadow)] backdrop-blur-xl">
    <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-ember"><AlertTriangle className="h-4 w-4" /> Sol {event.sol} / Critical alert</p>
    <h3 className="text-xl font-semibold">{event.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.warning}</p>
    {presenter && crisis === "radiation" && <section aria-label="Radiation environment" className="mt-4 border-y border-border py-3">
      <p className="text-xs uppercase text-ember">Simulated Mars environment · Not live NASA telemetry</p>
      <dl className="mt-3 grid grid-cols-2 gap-3">{RADIATION_ENVIRONMENT.map(({ label, value }) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm">{value}</dd></div>)}</dl>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">Research exposure: 50 cGy (0.5 Gy), silicon-28 and iron-56 ions, human intestinal gut-on-chip cells. This is a laboratory exposure, not a measured Martian storm dose.</p>
      <Button asChild variant="link" className="h-auto whitespace-normal px-0 text-telemetry"><a href={DONKI_URL} target="_blank" rel="noreferrer">NASA DONKI · Space-weather event catalog</a></Button>
      <p className="text-xs leading-5 text-muted-foreground">DONKI provides space-weather context; no live event or Mars-specific radiation measurement is loaded in this demonstration.</p>
    </section>}
    {"scienceLog" in event && <Collapsible key={presenter ? "presenter" : "mission"} defaultOpen={presenter} className="mt-3">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="group h-auto max-w-full gap-2 whitespace-normal px-0 text-left text-telemetry">
          NASA OSDR Science Log <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
        <p>{event.scienceLog.text}</p>
        <Button asChild variant="link" className="h-auto px-0 text-telemetry"><a href={event.scienceLog.url} target="_blank" rel="noreferrer">NASA OSDR · OSD-1010</a></Button>
      </CollapsibleContent>
    </Collapsible>}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {(["A", "B"] as const).map((choice) => {
        const option = event.choices[choice];
        return <Button key={choice} variant="outline" onClick={() => onChoose(choice)} className="h-auto min-h-16 flex-col items-start whitespace-normal px-4 py-3 text-left">
        <span className="text-xs text-ember">Option {choice}</span>
        <span>{option.label}</span>
         <span className="text-[10px] font-normal text-muted-foreground">{choiceApproach(crisis, choice)}</span>
        <span className="text-[10px] font-normal text-muted-foreground">{Object.entries(option.delta).map(([key, value]) => `${key === "oxygen" ? "O₂" : key.charAt(0).toUpperCase() + key.slice(1)} ${value > 0 ? "+" : ""}${value}`).join(" · ")}</span>
          {option.risk && <span className="text-[10px] font-normal text-destructive">{option.risk.note}</span>}
      </Button>;
      })}
    </div>
  </div>;
}