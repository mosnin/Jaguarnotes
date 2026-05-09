export default function SettingsLoading() {
  return (
    <div className="max-w-xl space-y-6">
      {/* Page title */}
      <div>
        <div className="h-7 w-36 animate-pulse rounded-lg bg-line-1" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-line-1" />
      </div>

      {/* Card 1 */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-line-1" />
        <div className="mb-4 h-3 w-48 animate-pulse rounded bg-line-1" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-line-1" />
          ))}
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl bg-surface p-6 neu-card">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-line-1" />
        <div className="mb-4 h-3 w-56 animate-pulse rounded bg-line-1" />
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-28 animate-pulse rounded-full bg-line-1" />
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="h-10 w-36 animate-pulse rounded-xl bg-line-1" />
    </div>
  );
}
