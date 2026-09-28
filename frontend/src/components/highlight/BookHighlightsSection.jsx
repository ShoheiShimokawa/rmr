import { useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { CustomDialog } from "../../ui/CustomDialog";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { useMyHighlights } from "../../hooks/useHighlight";
import { HighlightComposer } from "./HighlightComposer";
import { HighlightList } from "./HighlightList";
import { filterHighlights } from "./highlightUtils";

/** 本の詳細ページに出す、その本についての自分のQuotes一覧と追加ボタン。 */
export const BookHighlightsSection = ({ book, reading, userId }) => {
  const [openComposer, setOpenComposer] = useState(false);
  const { data: myHighlights = [] } = useMyHighlights();
  const bookHighlights = useMemo(
    () => filterHighlights(myHighlights, { bookId: book.bookId }),
    [myHighlights, book.bookId]
  );

  return (
    <div>
      <CustomDialog open={openComposer} title="Add quote" onClose={() => setOpenComposer(false)}>
        <HighlightComposer
          book={book}
          reading={reading}
          entryPoint="book_detail"
          onSaved={() => setOpenComposer(false)}
          showBookInfo={false}
        />
      </CustomDialog>
      <div className="flex justify-between items-center mt-3 mb-1">
        <div className="font-soft font-bold">
          Your quotes{bookHighlights.length > 0 ? ` (${bookHighlights.length})` : ""}
        </div>
        <PrimaryButton size="small" startIcon={<AddIcon />} onClick={() => setOpenComposer(true)}>
          Add
        </PrimaryButton>
      </div>
      {bookHighlights.length > 0 ? (
        <HighlightList highlights={bookHighlights} isOwner ownerId={userId} showBook={false} />
      ) : (
        <div className="text-sm text-zinc-500 dark:text-zinc-400 font-soft">
          No quotes from this book yet.
        </div>
      )}
    </div>
  );
};
