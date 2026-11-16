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

- Public site chrome (header, footer, theme toggle) lives in `src/components/site/` and wraps every route from `src/routes/__root.tsx`; why: one shared layout for public and member areas.
- Theme is a `dark` class on `<html>` set by an inline head script from localStorage key `guapa-theme`; why: avoids light/dark flash before hydration.
- All colors come from tokens in `src/styles.css` (incl. `gold`, `success`, `surface`); components never use raw color classes.
- Auth: email/password via Lovable Cloud; UNAM-only signup is enforced by the `handle_new_user` trigger on auth.users (client zod check in `src/lib/auth-rules.ts` only mirrors it); why: the domain rule must hold even if the UI is bypassed.
- Roles live in `public.user_roles` checked with `has_role()`; private pages under `src/routes/_authenticated/`, admin pages under `_authenticated/_admin/`; session state comes from `AuthProvider` in `src/lib/auth.tsx`; why: permissions are enforced by RLS, route guards only shape the UI.
- Public activities/schedules come from the database via `src/lib/public-content.ts`, falling back to marked sample data in `src/content/site.ts` when empty; contact info still lives only in `src/content/site.ts`; why: site never looks empty before admins publish.
- Team rules (5-member cap, creator auto-join, eligibility) are enforced by DB triggers; `src/lib/team-rules.ts` only mirrors them for UI messages; why: limits hold even if the UI is bypassed.
