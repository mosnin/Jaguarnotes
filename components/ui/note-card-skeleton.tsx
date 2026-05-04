export function NoteCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2 rounded-xl border border-line-1 bg-surface p-4">
      <div className="h-3.5 w-3/4 rounded-md bg-raised" />
      <div className="h-3 w-full rounded-md bg-raised" />
      <div className="h-3 w-2/3 rounded-md bg-raised" />
      <div className="mt-1 flex gap-1">
        <div className="h-4 w-12 rounded-full bg-raised" />
        <div className="h-4 w-10 rounded-full bg-raised" />
      </div>
    </div>
  );
}
