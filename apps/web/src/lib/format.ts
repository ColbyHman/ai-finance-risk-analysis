/**
 * Small, dependency-free relative-time formatting shared by any
 * component that needs a quick "how long ago" label (e.g. a
 * holding's last_ingested_at). No library — the inputs here are
 * always "null or an ISO timestamp from our own backend," not
 * arbitrary user dates, so the handful of buckets below are enough.
 */
export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "never";

  const diffMs = Date.now() - then;
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 45) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
