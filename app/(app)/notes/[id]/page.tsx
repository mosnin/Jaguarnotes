import { NoteEditor } from "@/components/editor/note-editor";

export default function NotePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { cmd?: string; topic?: string };
}) {
  return (
    <NoteEditor
      noteId={params.id}
      initialCmd={searchParams.cmd}
      initialTopic={searchParams.topic}
    />
  );
}
