export default function DashboardLoading() {
  return (
    <div className="flex h-full flex-col px-4 pt-6 pb-24 md:px-8 md:pt-8">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-line-1" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-line-1" />
      </div>

      {/* Time filter pills */}
      <div className="mb-4 flex gap-2">
        {[60, 48, 52].map((w, i) => (
          <div key={i} className={`h-7 w-${w > 55 ? 16 : w > 50 ? 14 : 12} animate-pulse rounded-full bg-line-1`} style={{ width: w }} />
        ))}
      </div>

      {/* Note cards row */}
      <div className="mb-8 flex gap-3 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-52 w-44 shrink-0 animate-pulse rounded-2xl bg-line-1" />
        ))}
      </div>

      {/* Section label */}
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-line-1" />

      {/* Tag folders row */}
      <div className="mb-8 flex gap-3 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 w-28 shrink-0 animate-pulse rounded-2xl bg-line-1" />
        ))}
      </div>

      {/* Quick start section */}
      <div className="mb-3 h-4 w-32 animate-pulse rounded bg-line-1" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-line-1 mb-4" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-line-1" />
        ))}
      </div>
    </div>
  );
}
