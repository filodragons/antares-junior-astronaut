import { useState } from "react";
import { Presentation, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MISSION_SOLS } from "@/lib/mission";

export function PresenterToolbar({ active, sol, onJump, onExit }: { active: boolean; sol: number; onJump: (sol: number) => void; onExit: () => void }) {
  const [open, setOpen] = useState(false);
  return <Collapsible open={open} onOpenChange={setOpen} className="border-t border-border bg-background px-6 py-2 md:px-10">
    <CollapsibleTrigger asChild><Button variant="ghost" size="sm" className="text-xs text-muted-foreground"><Presentation className="h-4 w-4" /> Presenter / Developer Mode</Button></CollapsibleTrigger>
    <CollapsibleContent className="space-y-3 py-3">
      <p role="status" className="text-xs text-telemetry">{active ? `Demonstration · Sol ${sol} · Clock paused · Unscored` : "Mission mode"}</p>
      <div className="flex flex-wrap gap-2" aria-label="Presenter Sol selection">
        {Array.from({ length: MISSION_SOLS }, (_, index) => index + 1).map((value) => <Button key={value} variant="outline" size="sm" aria-pressed={active && sol === value} onClick={() => onJump(value)} className={active && sol === value ? "border-telemetry text-telemetry" : "text-muted-foreground"}>Sol {value}</Button>)}
        {active && <Button variant="ghost" size="sm" onClick={onExit}><RotateCcw className="h-4 w-4" /> Return to mission</Button>}
      </div>
    </CollapsibleContent>
  </Collapsible>;
}