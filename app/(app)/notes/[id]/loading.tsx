export default function NoteLoading() {
  return (
    <div className="flex h-full flex-col">
      {/* Top bar skeleton */}
      <div className="flex h-12 items-center gap-3 border-b border-line-1 px-4">
        <div className="h-5 w-5 animate-pulse rounded bg-line-1" />
        <div className="h-5 w-5 animate-pulse rounded bg-line-1" />
        <div className="mx-auto h-5 w-48 animate-pulse rounded bg-line-1" />
        <div className="h-5 w-5 animate-pulse rounded bg-line-1" />
        <div className="h-5 w-5 animate-pulse rounded bg-line-1" />
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-hidden px-8 pt-10 md:px-16 lg:px-24">
        {/* Emoji + title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-line-1" />
          <div className="h-9 w-64 animate-pulse rounded-lg bg-line-1" />
        </div>

        {/* Content lines */}
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-line-1" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-line-1" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-line-1" />
          <div className="mt-6 h-4 w-full animate-pulse rounded bg-line-1" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-line-1" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-line-1" />
          <div className="mt-6 h-4 w-2/3 animate-pulse rounded bg-line-1" />
          <div className="h-4 w-full animate-pulse rounded bg-line-1" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-line-1" />
        </div>
      </div>
    </div>
  );
}
