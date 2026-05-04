import { NoteEditor } from "@/components/editor/note-editor";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function NotePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cmd?: string; topic?: string };
}) {
  return (
    <ErrorBoundary>
      <NoteEditor
        noteId={params.id}
        initialCmd={searchParams.cmd}
        initialTopic={searchParams.topic}
      />
    </ErrorBoundary>
  );
}
