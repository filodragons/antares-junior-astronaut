import { Trophy, Power, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function MissionEnding({ outcome, name, open, onClose }: { outcome: "win" | "fail"; name: string; open: boolean; onClose: () => void }) {
  const won = outcome === "win";
  return <Dialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
    <DialogContent className={`w-[calc(100%-32px)] max-w-lg rounded-md bg-background/95 p-8 text-center backdrop-blur-xl shadow-[var(--mission-shadow)] ${won ? "border-telemetry/50" : "border-destructive/50"}`}>
      {won ? <Trophy className="mx-auto h-12 w-12 text-power" /> : <Power className="mx-auto h-12 w-12 text-destructive" />}
      <p className={`text-xs uppercase tracking-widest ${won ? "text-telemetry" : "text-muted-foreground"}`}>{won ? "Mission accomplished / Sol 007" : "Mission failed / Sol 007"}</p>
      <DialogTitle className="text-3xl leading-tight">{won ? "Colony secured" : "Colony power-down"}</DialogTitle>
      <DialogDescription className="break-words text-base leading-7">{won ? `Commander ${name}, your colony survived all seven Martian Sols. Every core resource remained online.` : `Commander ${name}, a core resource was depleted during the mission. The seven-Sol mission has ended in emergency shutdown.`}</DialogDescription>
      <div className="mt-3 flex flex-wrap justify-center gap-3"><Button variant="outline" onClick={onClose}>Review mission</Button><Button asChild><Link to="/"><ArrowLeft /> Back to orbit</Link></Button></div>
    </DialogContent>
  </Dialog>;
}