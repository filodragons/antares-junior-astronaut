import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, Check, Circle, Droplets, Wind, Zap, ShieldCheck, Radio, BookOpen, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MISSION_SOLS, missionClock, playMissionTap } from "@/lib/mission";
import landscape from "@/assets/colony-landscape.jpg";
import badge from "@/assets/nasa-space-apps.png.asset.json";
import { CommandDeck } from "@/components/command-deck";
import { advanceResources, hasDepletedResource, missionOutcome, INITIAL_COMMANDS, INITIAL_RESOURCES, triggerTestCrisis, type Commands } from "@/lib/survival";
import { prepareMissionAudio, playMissionSound } from "@/lib/mission-audio";
import { MissionEnding } from "@/components/mission-ending";
import { SolCrisisAlert } from "@/components/sol-crisis-alert";
import { applyCrisisChoice, pendingSolCrisis, type CrisisId, type ChoiceId } from "@/lib/sol-crises";

export const Route = createFileRoute("/colony")({
  validateSearch: (s: Record<string, unknown>) => ({ name: typeof s["name"] === "string" ? s["name"] : "Commander" }),
  head: () => ({
    meta: [
      { title: "Mission Control — ANTARES" },
      { name: "description", content: "Command your Mars colony across seven Martian Sols with live mission timing and core resource telemetry." },
      { property: "og:title", content: "Mission Control — ANTARES" },
      { property: "og:description", content: "Your seven-Sol Mars mission: oxygen, water, power, and radiation shielding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Colony,
});

const briefing = "Welcome to ANTARES Mission Control, Commander! Your mission is to keep your Mars colony and your life safe over the next 7 Martian Sols. Each Martian Sol equals 1 minute of real time. Monitor your core resources (Oxygen, Water, Power, and Radiation Shield) and make the right daily command decisions. Beware of unexpected crises! Good luck, Commander!";
const resources = [
  { key: "oxygen", label: "Oxygen / MOXIE", detail: "O₂ GENERATOR", Icon: Wind, color: "text-telemetry", bar: "bg-telemetry" },
  { key: "water", label: "Water", detail: "H₂O RESERVES", Icon: Droplets, color: "text-water", bar: "bg-water" },
  { key: "power", label: "Power", detail: "ENERGY STORAGE", Icon: Zap, color: "text-power", bar: "bg-power" },
  { key: "shield", label: "Radiation Shield", detail: "HABITAT INTEGRITY", Icon: ShieldCheck, color: "text-ember", bar: "bg-ember" },
] as const;

function Colony() {
  const { name } = Route.useSearch();
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const clock = missionClock(elapsed);
  const [commands, setCommands] = useState(INITIAL_COMMANDS);
  const [telemetry, setTelemetry] = useState(INITIAL_RESOURCES);
  const [crisis, setCrisis] = useState(false);
  const [transitionSol, setTransitionSol] = useState<number | null>(null);
  const lastElapsed = useRef(0);
  const lastCompleted = useRef(0);
  const [appliedElapsed, setAppliedElapsed] = useState(0);
  const [depleted, setDepleted] = useState(false);
  const [outcome, setOutcome] = useState<"win" | "fail" | null>(null);
  const [endingOpen, setEndingOpen] = useState(false);
  const [activeSolCrisis, setActiveSolCrisis] = useState<CrisisId | null>(null);
  const [resolvedCrises, setResolvedCrises] = useState<CrisisId[]>([]);
  const alertRef = useRef<HTMLDivElement>(null);
  const dustActive = crisis || activeSolCrisis === "dust";

  useEffect(() => {
    if (startedAt === null || clock.finished || activeSolCrisis !== null) return;
    const next = pendingSolCrisis(clock.currentSol, resolvedCrises);
    if (next !== null) setActiveSolCrisis(next);
  }, [startedAt, clock.finished, clock.currentSol, activeSolCrisis, resolvedCrises]);

  useEffect(() => {
    if (activeSolCrisis === null || briefingOpen) return;
    alertRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [activeSolCrisis, briefingOpen]);

  const chooseCrisis = (choice: ChoiceId) => {
    if (activeSolCrisis === null || clock.finished) return;
    playMissionTap();
    setTelemetry((current) => applyCrisisChoice(current, activeSolCrisis, choice));
    setResolvedCrises((current) => [...current, activeSolCrisis]);
    setActiveSolCrisis(null);
  };

  useEffect(() => {
    if (hasDepletedResource(telemetry)) setDepleted(true);
  }, [telemetry]);

  useEffect(() => {
    if (!clock.finished || appliedElapsed < 420 || outcome !== null) return;
    const result = missionOutcome(clock.completed, telemetry, depleted);
    if (!result) return;
    setOutcome(result);
    setEndingOpen(true);
    setCrisis(false);
    setActiveSolCrisis(null);
    playMissionSound(result);
  }, [clock.finished, clock.completed, appliedElapsed, telemetry, depleted, outcome]);

  useEffect(() => {
    if ((!crisis && activeSolCrisis === null) || clock.finished) return;
    playMissionSound("warning");
    const warning = window.setInterval(() => playMissionSound("warning"), 5000);
    return () => window.clearInterval(warning);
  }, [crisis, activeSolCrisis, clock.finished]);

  useEffect(() => {
    const bounded = Math.min(elapsed, 420);
    const delta = bounded - lastElapsed.current;
    if (delta <= 0) return;
    lastElapsed.current = bounded;
    setTelemetry((current) => advanceResources(current, commands, delta, dustActive));
    setAppliedElapsed(bounded);
  }, [elapsed, commands, dustActive]);

  useEffect(() => {
    if (clock.completed === 0 || clock.completed <= lastCompleted.current) return;
    lastCompleted.current = clock.completed;
    setTransitionSol(clock.completed);
    const timeout = window.setTimeout(() => setTransitionSol(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [clock.completed]);

  const toggleCommand = (key: keyof Commands) => {
    if (startedAt === null || clock.finished) return;
    playMissionTap();
    setCommands((current) => ({ ...current, [key]: !current[key] }));
  };

  useEffect(() => {
    if (startedAt === null || clock.finished) return;
    const interval = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(interval);
  }, [startedAt, clock.finished]);

  const acknowledge = () => {
    prepareMissionAudio();
    playMissionTap();
    setBriefingOpen(false);
    if (startedAt === null) setStartedAt(Date.now());
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-border px-6 py-5 md:px-10">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Link to="/" aria-label="Back to orbit"><ArrowLeft /></Link>
            </Button>
            <span className="text-lg font-bold tracking-[0.3em] text-logo">ANTARES</span>
            <span className="hidden border-l border-border pl-3 text-xs uppercase text-muted-foreground sm:inline">Mission Control</span>
          </div>
          <h1 className="break-words text-xl font-semibold md:text-2xl">Welcome, Commander {name}</h1>
        </div>
        <a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer" aria-label="NASA Space Apps Challenge" className="inline-flex border border-border bg-card/50 px-5 py-3 shadow-[var(--mission-shadow)]">
          <img src={badge.url} alt="NASA Space Apps Challenge" width={180} height={69} className="h-12 w-40 object-contain" />
        </a>
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="relative flex min-h-[480px] flex-col justify-between overflow-hidden px-6 py-7 md:px-10 lg:min-h-[calc(100vh-130px)]" aria-label="Colony overview">
          <img src={landscape} alt="Mars colony habitats and solar arrays beneath a red Martian sky" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-[image:var(--mission-overlay)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-ember">Surface operations / Sector 01</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Antares Base</h2>
            </div>
            <span className="flex items-center gap-2 border border-border bg-background/70 px-3 py-2 text-xs text-telemetry"><Radio className="h-4 w-4" /> UPLINK ACTIVE</span>
          </div>
          <div className="relative mt-36">
            <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-widest text-telemetry"><Activity className="h-4 w-4" /> {clock.finished ? "Seven Sols completed" : startedAt === null ? "Awaiting commander" : "Mission in progress"}</div>
            <div className="flex flex-wrap items-end justify-between gap-5 border-t border-border pt-5">
              <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Mission elapsed</p><p className="mt-2 text-3xl tabular-nums">{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")} <span className="text-sm text-muted-foreground">/ 07:00</span></p></div>
              <Button variant="outline" onClick={() => setBriefingOpen(true)} className="bg-background/70"><BookOpen /> Mission briefing</Button>
            </div>
          </div>
        </section>

        <aside className="border-t border-border bg-background p-6 lg:border-l lg:border-t-0" aria-label="Mission telemetry">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-sm uppercase tracking-widest">Core resources</h2><Activity className="h-4 w-4 text-ember" /></div>
          <div className="grid grid-cols-2 gap-3">
            {resources.map(({ key, label, detail, Icon, color, bar }) => (
              <article key={label} className="min-w-0 rounded-md border border-border bg-card/60 p-4">
                <Icon className={`mb-4 h-5 w-5 ${color}`} />
                <h3 className="min-h-10 text-sm leading-5">{label}</h3>
                <p className="mt-1 text-3xl tabular-nums">{Math.round(telemetry[key])}<span className="text-sm text-muted-foreground">%</span></p>
                <div role="meter" aria-label={label} aria-valuenow={Math.round(telemetry[key])} aria-valuemin={0} aria-valuemax={100} className="my-3 h-1 w-full overflow-hidden rounded-full bg-muted"><svg viewBox="0 0 100 1" preserveAspectRatio="none" className={`h-full w-full ${color}`} aria-hidden="true"><rect width={telemetry[key]} height="1" fill="currentColor" /></svg></div>
                <p className="text-[9px] text-muted-foreground">{detail}</p>
              </article>
            ))}
          </div>
          <section className="mt-7 border-t border-border pt-6" aria-label="Sol tracker">
            <div className="flex items-center justify-between"><h2 className="text-sm uppercase tracking-widest">Sol tracker</h2><span className="text-xs text-ember">{clock.completed} / {MISSION_SOLS}</span></div>
            <div className="my-4 flex items-baseline justify-between"><p className="text-3xl">SOL {String(clock.currentSol).padStart(2, "0")}</p><span className="text-sm tabular-nums text-muted-foreground">{clock.finished ? "COMPLETE" : `${String(Math.floor(clock.remaining / 60)).padStart(2, "0")}:${String(clock.remaining % 60).padStart(2, "0")}`}</span></div>
            <ol className="space-y-1">
              {Array.from({ length: MISSION_SOLS }, (_, i) => {
                const complete = i < clock.completed;
                const active = !clock.finished && i + 1 === clock.currentSol;
                return <li key={i} className={`flex items-center justify-between border-b border-border py-2.5 text-xs ${complete ? "text-telemetry" : active ? "text-ember" : "text-muted-foreground"}`}><span>SOL {String(i + 1).padStart(2, "0")}</span><span className="flex items-center gap-3">{complete ? "Completed" : active ? "Current" : "Pending"}{complete ? <Check aria-label={`Sol ${i + 1} completed`} className="h-4 w-4" /> : <Circle aria-hidden="true" className="h-4 w-4" />}</span></li>;
              })}
            </ol>
          </section>
        </aside>
      </div>

      <CommandDeck commands={commands} disabled={startedAt === null || clock.finished} crisis={crisis} alert={activeSolCrisis !== null && !clock.finished ? <div ref={alertRef}><SolCrisisAlert crisis={activeSolCrisis} onChoose={chooseCrisis} /></div> : null} onToggle={toggleCommand} onTest={() => {
        if (startedAt === null || clock.finished || crisis) return;
        playMissionTap();
        setTelemetry(triggerTestCrisis);
        setCrisis(true);
      }} onResolve={() => { playMissionTap(); setCrisis(false); }} />

      {transitionSol !== null && <div key={transitionSol} role="status" aria-live="polite" className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
        <div className="sol-transition border-y border-primary/40 bg-background/90 px-10 py-7 text-center shadow-[var(--mission-shadow)]">
          <Check className="mx-auto mb-3 h-7 w-7 text-telemetry" />
          <p className="text-2xl font-semibold text-foreground">Sol {transitionSol} completed</p>
        </div>
      </div>}

      {outcome !== null && <MissionEnding outcome={outcome} name={name} open={endingOpen} onClose={() => setEndingOpen(false)} />}

      <Dialog open={briefingOpen} onOpenChange={(open) => { if (open) setBriefingOpen(true); }}>
        <DialogContent className="w-[calc(100%-32px)] max-w-xl rounded-md border-primary/40 bg-background p-7 shadow-[var(--mission-shadow)] [&>button]:hidden" onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()}>
          <Orbit className="h-9 w-9 text-ember" />
          <p className="text-xs uppercase tracking-widest text-ember">Incoming transmission / Sol 001</p>
          <DialogTitle className="text-2xl leading-tight">Mission briefing</DialogTitle>
          <DialogDescription className="text-base leading-7 text-foreground/85">{briefing}</DialogDescription>
          <div className="mt-3"><Button onClick={acknowledge} className="w-full"><Check /> I understand</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
