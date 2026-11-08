import { notFound } from "next/navigation";
import { TopNav } from "@/components/SiteNav";
import { LiveHoldingDetailView } from "@/components/LiveHoldingDetailView";
import { fetchHoldingDetail, HoldingNotFoundError } from "@/lib/live-finance";

// This route always fetches live, per-ticker data from Conduit at
// request time — it can't be statically prerendered. Under this repo's
// cacheComponents config (next.config.ts), an uncached fetch outside
// Suspense blocks prerendering unless the route opts into blocking
// (non-prerendered) rendering explicitly.
export const instant = false;

export default async function SecurityDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();

  try {
    const detail = await fetchHoldingDetail(ticker);
    return (
      <div className="min-h-screen">
        <TopNav current="/securities" />
        <LiveHoldingDetailView detail={detail} />
      </div>
    );
  } catch (err) {
    if (err instanceof HoldingNotFoundError) {
      notFound();
    }
    throw err;
  }
}
