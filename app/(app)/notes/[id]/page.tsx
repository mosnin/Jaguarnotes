import { NoteEditor } from "@/components/editor/note-editor";

export default function NotePage({ params }: { params: { id: string } }) {
  return <NoteEditor noteId={params.id} />;
}
