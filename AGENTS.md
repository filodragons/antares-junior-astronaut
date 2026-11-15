<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep mission timing in the pure browser-safe mission module and start its clock after briefing acknowledgement; this makes Sol boundaries testable without storing session-only game state.
- Keep survival calculations in a pure browser-safe module and append command controls after the existing dashboard; this isolates testable resource trade-offs without repositioning the header or HUD.
- Evaluate endings only after final resource telemetry and every scheduled decision are applied, retaining any depletion during the run and allowing unanswered choices after the timer ends; this prevents stale scores and forced losses at the final Sol boundary.
- Unlock a shared browser audio context on briefing acknowledgement; this supports later crisis and ending sounds without autoplay assumptions.
- Define scheduled Sol crises and choice resource deltas in a pure module, rendering them in the command deck alert slot; this keeps event sequencing testable and preserves the HUD layout.
- Keep crisis failure conditions (a resource threshold that can zero a resource) as data on the choice inside the pure crisis module; this keeps risky endings testable without touching the alert UI.
- Keep content-based tactical evaluation and the inclusive danger threshold in the pure crisis module; compare choice trade-offs against pre-choice reserves, check every telemetry update, and require all seven decisions before final evaluation so button letters and stale resources cannot determine endings.
- Keep presenter scenarios browser-safe and session-only; pause the clock, snapshot and restore mission state, and label simulated environmental values separately from cited laboratory evidence so judge demonstrations never affect real mission results or imply live NASA data.
