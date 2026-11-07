"use client";

import Link from "next/link";
import { useState } from "react";
import type { HoldingDetail, Source, VerdictType } from "@/lib/triage";

function StatusChip({ status }: { status: "act" | "watch" | "none" }) {
  const label = status === "act" ? "Act" : status === "watch" ? "Watch" : "No action";
  const cls =
    status === "act"
      ? "bg-[#f87171] text-[#191c1f] border-[#f87171]"
      : status === "watch"
      ? "bg-[#fbbf24] text-[#191c1f] border-[#fbbf24]"
      : "bg-[#262b32] text-[#9ba3ab] border-[#2d333b]";
  return <span className={`rounded-md border px-3 py-[5px] text-[10.5px] font-bold uppercase tracking-[0.04em] ${cls}`}>{label}</span>;
}

function VerdictChip({ type, label }: { type: VerdictType; label: string }) {
  const cls =
    type === "weakens"
      ? "bg-[rgba(251,191,36,0.14)] text-[#fbbf24] border-[rgba(251,191,36,0.4)]"
      : type === "supports"
      ? "bg-[rgba(74,222,128,0.14)] text-[#4ade80] border-[rgba(74,222,128,0.4)]"
      : "bg-[#262b32] text-[#9ba3ab] border-[#2d333b]";
  return <span className={`rounded-md border px-[11px] py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
}

export function HoldingDetailView({ ticker, detail }: { ticker: string; detail: HoldingDetail }) {
  const [reviewed, setReviewed] = useState(false);
  const [drawerSource, setDrawerSource] = useState<Source | null>(null);

  function openSource(cite: number) {
    const s = detail.sources[cite];
    if (s) setDrawerSource(s);
  }

  function renderList(items: [string, number][]) {
    if (!items.length) {
      return <p className="text-[12.5px] text-[#6b7280]">None this period.</p>;
    }
    return (
      <ul className="m-0 list-disc pl-4 text-[12.5px] leading-[1.65] text-[#9ba3ab]">
        {items.map(([text, cite]) => (
          <li key={cite} className="mb-[7px]">
            {text}
            <button
              type="button"
              className="ml-[1px] cursor-pointer rounded bg-[#262b32] px-1 py-[1px] align-super text-[10px] font-bold text-[#f4f4f4]"
              onClick={() => openSource(cite)}
            >
              [{cite}]
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 pb-[60px]">
      <Link href="/" className="mb-3.5 mt-4 inline-block text-xs text-[#9ba3ab] no-underline hover:text-[#f4f4f4]">
        ← Triage inbox
      </Link>

      <div className="mb-5 rounded-3xl bg-[#20242a] px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <p className="m-0 text-[28px] font-bold tracking-tight">{ticker}</p>
            <p className="mt-[3px] text-[12.5px] text-[#6b7280]">
              {detail.name} · {detail.weight} of portfolio
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={detail.status} />
            {detail.status !== "none" && (
              <button
                type="button"
                disabled={reviewed}
                onClick={() => setReviewed(true)}
                className="rounded-lg border border-white bg-white px-4 py-[7px] text-xs font-bold text-[#191c1f] transition-colors hover:border-[#9ba3ab] hover:bg-[#9ba3ab] disabled:opacity-60"
              >
                {reviewed ? "Reviewed ✓" : "Mark reviewed"}
              </button>
            )}
          </div>
        </div>
        <p className="mt-4 text-[11.5px] text-[#6b7280]">Confidence: {detail.confidence}</p>
      </div>

      <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">Thesis check</p>
      <div className="mb-4 rounded-[20px] bg-[#20242a] px-5 py-[18px]">
        <a href="#" className="float-right text-[11.5px] font-semibold text-[#6b7280] no-underline">
          Edit thesis
        </a>
        <p className="m-0 text-[13.5px] leading-[1.6] text-[#9ba3ab]">{detail.thesis}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5 border-t border-[#2d333b] pt-3.5">
          <VerdictChip type={detail.verdict.type} label={detail.verdict.label} />
          <span className="text-[12.5px] text-[#9ba3ab]">{detail.verdict.reason}</span>
        </div>
      </div>

      {(detail.bull.length > 0 || detail.bear.length > 0) && (
        <>
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
            Bull case / Bear case — this period&apos;s evidence
          </p>
          <div className="mb-4 rounded-[20px] bg-[#20242a] px-5 py-[18px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-[9px] text-[11.5px] font-bold uppercase tracking-[0.04em] text-[#4ade80]">Bull</h4>
                {renderList(detail.bull)}
              </div>
              <div>
                <h4 className="mb-[9px] text-[11.5px] font-bold uppercase tracking-[0.04em] text-[#f87171]">Bear</h4>
                {renderList(detail.bear)}
              </div>
            </div>
          </div>
        </>
      )}

      {detail.catalysts.length > 0 && (
        <>
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
            Upcoming catalysts
          </p>
          <div className="mb-4 rounded-[20px] bg-[#20242a] px-5 py-[18px]">
            <div className="flex flex-col gap-2.5">
              {detail.catalysts.map(([date, label]) => (
                <div key={label} className="flex items-center gap-3.5 text-[12.5px]">
                  <span className="w-[72px] flex-shrink-0 font-mono text-[11.5px] tabular-nums text-[#6b7280]">
                    {date}
                  </span>
                  <span className="text-[#9ba3ab]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {detail.timeline.length > 0 && (
        <>
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
            Timeline — what happened, in order
          </p>
          <div className="mb-4 rounded-[20px] bg-[#20242a] px-5 py-[18px]">
            {detail.timeline.map((t, idx) => (
              <div
                key={`${t.date}-${idx}`}
                className="relative ml-1 border-l-2 border-[#2d333b] py-0 pb-[18px] pl-[18px] last:pb-0"
              >
                <span
                  className={`absolute -left-[5px] top-[3px] h-2 w-2 rounded-full ${
                    t.flagged ? "bg-[#f87171]" : "bg-[#6b7280]"
                  }`}
                />
                <div className="mb-1 flex items-baseline gap-2.5">
                  <span className="font-mono text-[11px] tabular-nums text-[#6b7280]">{t.date}</span>
                  <span className="rounded bg-[#262b32] px-[7px] py-[2px] text-[10px] font-bold uppercase tracking-[0.03em] text-[#6b7280]">
                    {t.type}
                  </span>
                </div>
                <p className="m-0 mb-1.5 text-[13px] leading-[1.55] text-[#9ba3ab]">
                  {t.summary}
                  <button
                    type="button"
                    className="ml-[1px] cursor-pointer rounded bg-[#262b32] px-1 py-[1px] align-super text-[10px] font-bold text-[#f4f4f4]"
                    onClick={() => openSource(t.cite)}
                  >
                    [{t.cite}]
                  </button>
                </p>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-md border px-2 py-[2px] text-[10px] font-bold ${
                      t.tag === "primary"
                        ? "bg-[rgba(167,139,250,0.14)] text-[#a78bfa] border-[rgba(167,139,250,0.4)]"
                        : t.tag === "outlet"
                        ? "bg-[rgba(96,165,250,0.14)] text-[#60a5fa] border-[rgba(96,165,250,0.4)]"
                        : "bg-[#262b32] text-[#6b7280] border-[#2d333b]"
                    }`}
                  >
                    {t.tagLabel}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer border-none bg-none text-[11px] text-[#6b7280] underline"
                    onClick={() => openSource(t.cite)}
                  >
                    Show your work
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {detail.cantVerify.length > 0 && (
        <>
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
            What this system couldn&apos;t verify
          </p>
          <div className="mb-4 rounded-[14px] bg-[rgba(251,191,36,0.14)] px-[18px] py-3.5 text-xs leading-[1.6] text-[#9ba3ab]">
            This period&apos;s confidence is limited because:
            <ul className="mt-1.5 list-disc pl-4">
              {detail.cantVerify.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mt-[26px] text-center text-[11px] text-[#6b7280]">
        Information to help you form your own view — not a recommendation to buy, sell, or hold anything.
      </div>

      {drawerSource && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerSource(null)} />
          <aside className="absolute right-0 top-0 h-full w-[440px] max-w-[94vw] overflow-y-auto bg-[#20242a] p-[22px] shadow-[-8px_0_24px_rgba(0,0,0,0.4)]">
            <button
              type="button"
              className="float-right cursor-pointer border-none bg-none text-base text-[#6b7280]"
              onClick={() => setDrawerSource(null)}
            >
              ✕
            </button>
            <h3 className="m-0 mb-1 text-[15px] font-bold">{drawerSource.title}</h3>
            <p className="mt-0.5 text-xs text-[#6b7280]">
              {drawerSource.outlet} · {drawerSource.date}
            </p>
            <div className="mt-3 rounded-xl bg-[#262b32] p-3.5">
              <h4 className="m-0 mb-[7px] text-[10.5px] font-bold uppercase text-[#6b7280]">Source quality</h4>
              <p className="m-0 text-[12.5px] leading-[1.55] text-[#9ba3ab]">{drawerSource.quality}</p>
            </div>
            <div className="mt-3 rounded-xl bg-[#262b32] p-3.5">
              <h4 className="m-0 mb-[7px] text-[10.5px] font-bold uppercase text-[#6b7280]">Raw excerpt</h4>
              <p className="m-0 border-l-2 border-[#2d333b] pl-2.5 text-[12.5px] italic leading-[1.55] text-[#9ba3ab]">
                {drawerSource.excerpt}
              </p>
            </div>
            <div className="mt-3 rounded-xl bg-[#262b32] p-3.5">
              <h4 className="m-0 mb-[7px] text-[10.5px] font-bold uppercase text-[#6b7280]">Model classification</h4>
              <p className="m-0 text-[12.5px] leading-[1.55] text-[#9ba3ab]">{drawerSource.classification}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
