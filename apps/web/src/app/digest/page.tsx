import { redirect } from "next/navigation";

/**
 * /digest is retired — the triage inbox it used to render now lives
 * at `/` itself (see docs/adr/0011-triage-inbox-visual-implementation.md).
 * Redirect rather than delete the route outright, so old bookmarks/
 * links still land somewhere correct.
 */
export default function DigestRoutePage() {
  redirect("/");
}
