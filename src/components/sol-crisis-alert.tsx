import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOL_CRISES, type CrisisId, type ChoiceId } from "@/lib/sol-crises";

export function SolCrisisAlert({ crisis, onChoose }: { crisis: CrisisId; onChoose: (choice: ChoiceId) => void }) {
  const event = SOL_CRISES[crisis];
  return <div role="alert" aria-label={event.title} className="crisis-warning mx-auto mb-5 w-full max-w-2xl rounded-md border border-destructive/40 bg-background/95 p-5 shadow-[var(--mission-shadow)] backdrop-blur-xl">
    <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-ember"><AlertTriangle className="h-4 w-4" /> Sol {event.sol} / Critical alert</p>
    <h3 className="text-xl font-semibold">{event.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.warning}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {(["A", "B"] as const).map((choice) => <Button key={choice} variant="outline" onClick={() => onChoose(choice)} className="h-auto min-h-16 flex-col items-start whitespace-normal px-4 py-3 text-left">
        <span className="text-xs text-ember">Option {choice}</span>
        <span>{event.choices[choice].label}</span>
        <span className="text-[10px] font-normal text-muted-foreground">O₂ {event.choices[choice].delta.oxygen} · Water {event.choices[choice].delta.water} · Power {event.choices[choice].delta.power} · Shield {event.choices[choice].delta.shield}</span>
      </Button>)}
    </div>
  </div>;
}