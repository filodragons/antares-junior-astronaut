import { FlaskConical, ShieldCheck, Wind, Droplets, Zap, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Commands } from "@/lib/survival";

const actions = [
  { key: "moxie", label: "MOXIE", Icon: Wind, hint: "Generate oxygen; consumes power" },
  { key: "recycler", label: "Water recycler", Icon: Droplets, hint: "Recover water; consumes power" },
  { key: "solar", label: "Solar arrays", Icon: Zap, hint: "Recharge power; offline during dust storms" },
  { key: "shielding", label: "Radiation shield", Icon: ShieldCheck, hint: "Restore shielding; consumes power" },
] as const;

export function CommandDeck({ commands, disabled, crisis, onToggle, onTest, onResolve }: {
  commands: Commands;
  disabled: boolean;
  crisis: boolean;
  onToggle: (key: keyof Commands) => void;
  onTest: () => void;
  onResolve: () => void;
}) {
  return (
    <section aria-label="Command deck" className="border-t border-border bg-background px-6 py-5 md:px-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm uppercase tracking-widest">Command deck</h2>
        <span className="text-xs text-muted-foreground">{disabled ? "Standby" : "Daily operations"}</span>
      </div>
      {crisis && <div role="alert" className="crisis-warning mb-4 flex flex-wrap items-center justify-between gap-4 border-l-2 border-destructive bg-destructive/20 px-4 py-3 backdrop-blur-xl">
        <div><p className="flex items-center gap-2 text-sm text-ember"><AlertTriangle className="h-4 w-4" /> CRITICAL ALERT — Dust storm</p><p className="mt-1 text-xs text-muted-foreground">Solar arrays offline. Power reserves damaged. Shield integrity falling. React now.</p></div>
        <Button variant="outline" size="sm" onClick={onResolve} disabled={disabled}><Check /> Secure habitat</Button>
      </div>}
      <div className="flex flex-wrap items-center gap-3">
        {actions.map(({ key, label, Icon, hint }) => (
          <Button key={key} variant="outline" aria-pressed={commands[key]} disabled={disabled} title={hint} onClick={() => onToggle(key)} className={`h-12 min-w-40 flex-1 justify-between gap-3 ${commands[key] ? "border-telemetry/50 bg-telemetry/10 text-telemetry" : "text-muted-foreground"}`}>
            <span className="flex items-center gap-2"><Icon /> {label}</span><span className="text-[10px]">{commands[key] ? "ON" : "OFF"}</span>
          </Button>
        ))}
        <Button variant="ghost" size="sm" disabled={disabled || crisis} onClick={onTest} title="Judge preview: trigger a dust storm instantly" className="text-xs text-muted-foreground"><FlaskConical /> Test crisis</Button>
      </div>
    </section>
  );
}