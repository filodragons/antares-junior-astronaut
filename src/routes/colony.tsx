import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/colony")({
  validateSearch: (s: Record<string, unknown>) => ({ name: typeof s["name"] === "string" ? s["name"] : "Commander" }),
  head: () => ({
    meta: [
      { title: "Colony Base — ANTARES" },
      { name: "description", content: "Your Mars colony command center." },
      { property: "og:title", content: "Colony Base — ANTARES" },
      { property: "og:description", content: "Your Mars colony command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Colony,
});

function Colony() {
  const { name } = Route.useSearch();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,var(--glow),var(--background)_70%)] px-6 text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-ember">Docking complete</p>
      <h1 className="mt-4 text-4xl font-bold uppercase tracking-wide md:text-5xl">Welcome, Commander {name}</h1>
      <p className="mt-4 font-display text-lg text-muted-foreground">Your colony awaits its first orders.</p>
      <Link to="/" className="mt-8 text-sm uppercase tracking-widest text-primary hover:underline">← Back to orbit</Link>
    </main>
  );
}
