import { useMemo, useState } from "react";
import { CustomDialog } from "../../ui/CustomDialog";
import { BookDetail } from "../book/BookDetail";
import { useNotify } from "../../hooks/NotifyProvider";
import { useHighlightMutations } from "../../hooks/useHighlight";
import { track, EVENTS } from "../../tracking";
import { HighlightCard } from "./HighlightCard";
import { HighlightComposer } from "./HighlightComposer";
import { HighlightGroup } from "./HighlightGroup";
import { groupHighlightsByBook } from "./highlightUtils";

/**
 * 引用(Quote)の一覧表示。編集ダイアログ、削除確認、テキストのコピーをまとめて扱う。
 * showBookは、既に本の情報が別の場所(Record画面・本の詳細)に表示されている
 * 文脈では重複するため、falseでカードの表紙を省略できる。
 * groupByBookをtrueにすると、本ごとにまとめて表紙・書名を1回だけ出す表示に切り替わる
 * (マイページのように複数の本のQuotesが混在する一覧向け。showBookは無視される)。
 * onUseInReviewを渡すと、各行にReviewへ挿入するボタンを出す(Record画面のQuotesタブ用)。
 */
export const HighlightList = ({
  highlights,
  isOwner = true,
  ownerId,
  showBook = true,
  onUseInReview,
  groupByBook = false,
}) => {
  const { notify } = useNotify();
  const { deleteHighlight } = useHighlightMutations();
  const [editing, setEditing] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);

  const groups = useMemo(
    () => (groupByBook ? groupHighlightsByBook(highlights) : null),
    [groupByBook, highlights]
  );

  const handleCopy = async (highlight) => {
    try {
      await navigator.clipboard.writeText(highlight.quote);
      notify("Copied.", "success");
    } catch (error) {
      notify("Couldn't copy.", "error");
    }
  };

  const handleDelete = async (highlight) => {
    if (!window.confirm("Delete this quote?")) return;
    try {
      await deleteHighlight(highlight.memoId, { ownerId });
      track(EVENTS.HIGHLIGHT_DELETE);
      notify("Quote deleted.", "success");
    } catch (error) {
      notify("Something went wrong.", "error");
    }
  };

  return (
    <div>
      <CustomDialog open={!!editing} title="Edit quote" onClose={() => setEditing(null)}>
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
      <CustomDialog open={!!viewingBook} title="Detail" onClose={() => setViewingBook(null)}>
        {viewingBook && <BookDetail book={viewingBook} />}
      </CustomDialog>
      {groupByBook
        ? groups.map((group) => (
            <HighlightGroup
              key={group.book?.bookId ?? "unknown"}
              book={group.book}
              highlights={group.highlights}
              isOwner={isOwner}
              onEdit={setEditing}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onViewBook={setViewingBook}
              onUseInReview={onUseInReview}
            />
          ))
        : (highlights || []).map((highlight) => (
            <HighlightCard
              key={highlight.memoId}
              highlight={highlight}
              isOwner={isOwner}
              showBook={showBook}
              onEdit={setEditing}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onViewBook={setViewingBook}
              onUseInReview={onUseInReview}
            />
          ))}
    </div>
  );
};
