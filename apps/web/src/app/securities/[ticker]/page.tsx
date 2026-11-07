import { notFound } from "next/navigation";
import { TopNav } from "@/components/SiteNav";
import { HoldingDetailView } from "@/components/HoldingDetailView";
import { holdingDetails } from "@/lib/triage";

export function generateStaticParams() {
  return Object.keys(holdingDetails).map((ticker) => ({ ticker }));
}

export default async function SecurityDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: rawTicker } = await params;
  const ticker = Object.keys(holdingDetails).find(
    (t) => t.toLowerCase() === rawTicker.toLowerCase(),
  );
  const detail = ticker ? holdingDetails[ticker] : undefined;

  if (!detail || !ticker) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <TopNav current="/securities" />
      <HoldingDetailView ticker={ticker} detail={detail} />
    </div>
  );
}
