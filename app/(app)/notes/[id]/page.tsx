import { NoteEditor } from "@/components/editor/note-editor";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function NotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cmd?: string; topic?: string }>;
}) {
  const { id } = await params;
  const { cmd, topic } = await searchParams;

  return (
    <ErrorBoundary>
      <NoteEditor noteId={id} initialCmd={cmd} initialTopic={topic} />
    </ErrorBoundary>
  );
}
