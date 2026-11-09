import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import mars from "@/assets/mars.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ANTARES — Mars Colony Junior Commander" },
      { name: "description", content: "Enter your name and begin your junior astronaut mission trainer on Mars." },
      { property: "og:title", content: "ANTARES — Mars Colony Junior Commander" },
      { property: "og:description", content: "Build a junior astronaut mission trainer. Command your own Mars colony." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = ["Home", "About Us", "Colonies", "The Program", "Planets"];
const stats = [
  ["Moons", "Phobos · Deimos"],
  ["Radius", "3,390 km"],
  ["Distance from Sun", "227.9 million km"],
  ["Orbital Period", "687 days"],
];

function Index() {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    navigate({ to: "/colony", search: { name: n } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,var(--glow)_0%,transparent_60%)] opacity-50" />
      <img
        src={mars}
        alt="Mars eclipsed by the sun"
        width={1280}
        height={1280}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[min(110vh,95vw)] max-w-none -translate-x-1/2 -translate-y-[55%] opacity-95 mix-blend-screen [mask-image:radial-gradient(circle,black_55%,transparent_72%)]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_95%)]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="text-2xl font-bold tracking-[0.3em]">
          <span className="text-primary">ANT</span>ARES
        </div>
        <nav className="hidden gap-8 text-xs font-semibold uppercase tracking-widest md:flex">
          {nav.map((n, i) => (
            <a key={n} href="#" className={i === 0 ? "text-primary" : "hover:text-primary transition-colors"}>
              {n}
            </a>
          ))}
        </nav>
      </header>

      <aside className="absolute right-12 top-1/2 z-10 hidden -translate-y-1/2 space-y-6 text-center lg:block">
        {stats.map(([k, v]) => (
          <div key={k}>
            <div className="font-display text-xl uppercase tracking-wider">{k}</div>
            <div className="text-xs text-muted-foreground">{v}</div>
          </div>
        ))}
      </aside>

      <section className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-6 pb-16 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.5em] text-ember">Mission Trainer · Sol 001</p>
        <h1 className="max-w-3xl text-4xl font-bold uppercase leading-tight tracking-wide drop-shadow-[0_4px_30px_var(--glow)] md:text-6xl">
          Mars Colony Junior Commander
        </h1>
        <p className="mt-4 font-display text-lg italic text-muted-foreground md:text-xl">
          build a junior astronaut mission trainer
        </p>

        <form onSubmit={submit} className="mt-10 flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-card/40 p-1.5 shadow-[0_0_40px_-10px_var(--glow)] backdrop-blur-md focus-within:border-primary transition-colors">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your commander name"
            aria-label="Commander name"
            maxLength={40}
            className="min-w-0 flex-1 bg-transparent px-5 py-2 text-sm tracking-wide placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_var(--glow)] transition hover:brightness-110 disabled:opacity-50"
          >
            Enter Colony <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </section>
    </main>
  );
}
