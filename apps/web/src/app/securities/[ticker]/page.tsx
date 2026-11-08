import { Suspense } from "react";
import { TopNav } from "@/components/SiteNav";
import { SecurityDetailClient } from "@/components/SecurityDetailClient";

// Server Component wrapper: useParams() (needed by SecurityDetailClient)
// is a runtime-only value and blocks static prerendering under this
// repo's cacheComponents config unless wrapped in <Suspense> — this is
// Next's own recommended fix ("[stream] Wrap the component in
// <Suspense fallback={...}>"), not a workaround.
export default function SecurityDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <TopNav current="/securities" />
          <div className="mx-auto max-w-[980px] px-6 pb-[60px]">
            <p className="mt-8 text-[11.5px] text-[var(--ink-faint)]">Loading…</p>
          </div>
        </div>
      }
    >
      <SecurityDetailClient />
    </Suspense>
  );
}
