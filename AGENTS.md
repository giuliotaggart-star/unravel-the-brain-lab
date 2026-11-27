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

## Project rules
- Contact profiles use a two-column photo layout with one shared mission below; profile text and optional photo URLs stay in the central JSON so authors can update both people together.
- All site copy and data are read from `src/data/seaad-mtg.json` through `src/lib/unravel/data.ts`; components never hardcode content, so the authors can edit one file.
- Donor statistics live in `src/lib/unravel/stats.ts`, ported unchanged from the original app so lab verdicts match the source.
- Navigation: 5 groups from `journey` in the JSON live in the Menu sheet; practice steps are numbered except `standalone` ones (Solo explore); About is the hub, not a step.
- Student progress (poll, lab, essay, findings) stays in localStorage; the only exception is poll results, which are sent to the optional `pollEndpoint` from the JSON config when set, with a notice shown, matching the site's no-tracking privacy promise.
- Polls: the warm-up poll (/poll) hides answers; the exit poll (/exit-poll) reveals them and compares with the start. Both carry a random device id (`anonId`) via `src/lib/unravel/poll.ts` so rows pair up without names.
