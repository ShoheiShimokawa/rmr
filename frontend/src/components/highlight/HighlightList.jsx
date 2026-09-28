import { useState } from "react";
import { CustomDialog } from "../../ui/CustomDialog";
import { useNotify } from "../../hooks/NotifyProvider";
import { useHighlightMutations } from "../../hooks/useHighlight";
import { track, EVENTS } from "../../tracking";
import { HighlightCard } from "./HighlightCard";
import { HighlightComposer } from "./HighlightComposer";

/** ハイライトの一覧表示。編集ダイアログ、削除確認、テキストのコピーをまとめて扱う。 */
export const HighlightList = ({ highlights, isOwner = true, ownerId }) => {
  const { notify } = useNotify();
  const { deleteHighlight } = useHighlightMutations();
  const [editing, setEditing] = useState(null);

  const handleCopy = async (highlight) => {
    try {
      await navigator.clipboard.writeText(highlight.quote);
      notify("Copied.", "success");
    } catch (error) {
      notify("Couldn't copy.", "error");
    }
  };

  const handleDelete = async (highlight) => {
    if (!window.confirm("Delete this highlight?")) return;
    try {
      await deleteHighlight(highlight.memoId, { ownerId });
      track(EVENTS.HIGHLIGHT_DELETE);
      notify("Highlight deleted.", "success");
    } catch (error) {
      notify("Something went wrong.", "error");
    }
  };

  return (
    <div>
      <CustomDialog open={!!editing} title="Edit Highlight" onClose={() => setEditing(null)}>
        {editing && (
          <HighlightComposer
            book={editing.book}
            reading={{ readingId: editing.readingId, user: { userId: ownerId } }}
            highlight={editing}
            onSaved={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </CustomDialog>
      {(highlights || []).map((highlight) => (
        <HighlightCard
          key={highlight.memoId}
          highlight={highlight}
          isOwner={isOwner}
          onEdit={setEditing}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />
      ))}
    </div>
  );
};
