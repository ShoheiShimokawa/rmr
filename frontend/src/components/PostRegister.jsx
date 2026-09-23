import { registerBook } from "../api/book";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Box, CircularProgress, Divider, IconButton } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Book } from "./book/Book";
import { BookArray } from "./book/BookArray";
import { BookSearch } from "./book/BookSearch";
import { ReadingRegister } from "./ReadingRegister";
import { ReadingStatusChip } from "./book/ReadingStatusChip";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";
import { motion } from "framer-motion";
import { useReading, useReadingsByUser } from "../hooks/useReading";
import { useNotify } from "../hooks/NotifyProvider";
import {
  draftStatusLabel,
  hasDraftContent,
  useReadingDraft,
  useReadingDrafts,
} from "../hooks/useReadingDraft";

const lastTouchedAt = (reading) => {
  const dates = [
    reading.updateDate,
    reading.readingDate,
    reading.toReadDate,
    reading.registerDate,
  ]
    .map((d) => (d ? new Date(d).getTime() : NaN))
    .filter((t) => !Number.isNaN(t));
  return dates.length > 0 ? Math.max(...dates) : 0;
};

const SHELF_LIMIT = 30;

// バックエンド(ReadingService)がPostを作る条件と同じ基準。DONEでもrate/thoughtsが
// 空(＝Skipで完了しただけ)ならPostはまだ作られていないので、棚に残す。
const isAlreadyPosted = (reading) =>
  reading.statusType === "DONE" &&
  hasDraftContent({ rate: reading.rate, thoughts: reading.thoughts });

/**
 * 棚に並べる読書を、最後にさわった日時の新しい順に返します。
 * まだPostしていない本だけを対象にする(投稿済みの読了本は棚から外れる。
 * 検索からは引き続き開けるので、編集・削除自体は可能)。
 */
export const recentShelf = (readings = [], limit = SHELF_LIMIT) => {
  return readings
    .filter((r) => r.statusType !== "INVALID" && !isAlreadyPosted(r))
    .slice()
    .sort((a, b) => lastTouchedAt(b) - lastTouchedAt(a))
    .slice(0, limit);
};

export const PostRegister = () => {
  const { user } = useContext(UserContext);
  const userId = user?.userId;
  const { notify } = useNotify();
  const { registerReading, deleteReading } = useReading();
  const [selectedBook, setSelectedBook] = useState(null);
  const [showingSearchResults, setShowingSearchResults] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  // Discard後にReadingRegisterを再マウントして入力欄をその場で空にするためのカウンタ。
  // react-hook-formはinitialValuesを初回マウント時にしか読まないため、keyを変えて強制的に作り直す。
  const [discardVersion, setDiscardVersion] = useState(0);

  const { data: readings = [], isLoading: loadingReadings } =
    useReadingsByUser(userId);
  const { data: drafts = [], isLoading: loadingDrafts } =
    useReadingDrafts(userId);
  const { saveDraft, deleteDraft, status: draftStatus } =
    useReadingDraft(userId);

  const shelf = useMemo(() => recentShelf(readings), [readings]);
  const draftBookIds = useMemo(
    () => new Set(drafts.map((d) => d.book.bookId)),
    [drafts]
  );

  const selectedReading = selectedBook
    ? readings.find((r) => r.book.bookId === selectedBook.bookId) ?? null
    : null;
  const selectedDraft = selectedBook
    ? drafts.find((d) => d.book.bookId === selectedBook.bookId)
    : undefined;
  const draftLabel = draftStatusLabel(draftStatus, !!selectedDraft);
  const displayedStatus = pendingStatus ?? selectedReading?.statusType ?? null;

  // 本を選び直したら、前の本の楽観的なステータス表示を引き継がない
  useEffect(() => {
    setPendingStatus(null);
    setDiscardVersion(0);
  }, [selectedBook?.bookId]);

  const handleBookFromSearch = async (pickedBook) => {
    const book = {
      id: pickedBook.sourceId,
      isbn: pickedBook.isbn,
      title: pickedBook.title,
      author: pickedBook.author,
      genre: genreToEnum(pickedBook.genre),
      description: pickedBook.description,
      thumbnail: pickedBook.thumbnail,
      publishedDate: pickedBook.publishedDate,
    };
    try {
      const result = await registerBook(book);
      setSelectedBook(result.data);
    } catch (error) {
      notify("Failed to add this book.", "error");
    }
  };

  const handleSelectFromShelf = (reading) => {
    setSelectedBook(reading.book);
  };

  const handleChangeBook = () => {
    setSelectedBook(null);
  };

  // ReadingStatusChipからの状態変更はいずれも即時書き込み
  const handleStatusChange = async (status) => {
    if (!selectedBook || changingStatus || status === displayedStatus) return;
    if (selectedReading?.statusType === "DONE") {
      const ok = window.confirm(
        `This book is already marked as finished. Your rating and review will stay, but it will move back to ${
          status === "NONE" ? "To Read" : "Reading"
        }. Continue?`
      );
      if (!ok) return;
    }
    setPendingStatus(status);
    setChangingStatus(true);
    try {
      await registerReading(
        {
          bookId: selectedBook.bookId,
          userId,
          statusType: status,
          rate: 0,
          thoughts: "",
        },
        { sourceId: selectedBook.id }
      );
      notify(
        status === "NONE"
          ? "Added to your to-read list."
          : status === "DOING"
            ? "Marked as reading now."
            : "Marked as completed.",
        "success"
      );
    } catch (error) {
      setPendingStatus(null);
      notify("Something went wrong.", "error");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDeleteReading = async () => {
    if (!selectedReading) return;
    if (!window.confirm("Remove this book from your shelf?")) return;
    setChangingStatus(true);
    try {
      await deleteReading(selectedReading.readingId, {
        bookId: selectedBook.id,
        userId,
      });
      notify("Removed from your shelf.", "success");
      handleChangeBook();
    } catch (error) {
      notify("Something went wrong.", "error");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDraftChange = useCallback(
    (values) => {
      if (selectedBook) {
        saveDraft({ bookId: selectedBook.bookId, ...values });
      }
    },
    [selectedBook, saveDraft]
  );

  // 投稿完了・下書き破棄のどちらも、その本の下書きを消して選択を解除する
  const clearDraftAndSelection = () => {
    if (selectedBook) {
      deleteDraft(selectedBook.bookId);
    }
    setSelectedBook(null);
  };

  // Discardは下書きだけ消し、本の選択は解除しない(押し間違いやすいので確認を挟む)
  const handleDiscardDraft = async () => {
    if (!selectedBook) return;
    if (!window.confirm("Discard this draft? Your thoughts so far will be lost.")) {
      return;
    }
    // 削除がキャッシュに反映されるのを待ってから再マウントする(先に再マウントすると
    // 古い下書きをinitialValuesとして読み込み直してしまい、その場では変化して見えない)
    await deleteDraft(selectedBook.bookId);
    setDiscardVersion((v) => v + 1);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            p: 2,
          }}
        >
          <div className="text-2xl font-soft font-bold mb-3">
            Record Your Reading ✍🏻
          </div>

          {!selectedBook && (
            <>
              <BookSearch
                embedded
                fromPost={handleBookFromSearch}
                onResultsChange={setShowingSearchResults}
              />
              {!showingSearchResults && (
                <div className="mt-1 mb-2">
                  <div className="mb-2 ml-1 font-soft font-bold text-stone-800 dark:text-stone-200">
                    Your shelf
                  </div>
                  {loadingReadings ? (
                    <div className="flex justify-center items-center min-h-[100px]">
                      <CircularProgress size={20} />
                    </div>
                  ) : shelf.length >= 1 ? (
                    <div className="w-full overflow-x-auto">
                      <BookArray
                        books={shelf}
                        handleSelect={handleSelectFromShelf}
                        width={"70px"}
                        height={"100px"}
                        draftBookIds={draftBookIds}
                      />
                    </div>
                  ) : (
                    <div className="ml-1 text-sm font-soft text-zinc-500 dark:text-zinc-400">
                      Search above to add your first book.
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {selectedBook && (
            <div>
              <Box
                sx={{
                  position: "sticky",
                  top: "65px",
                  zIndex: 1,
                  bgcolor: "background.paper",
                  pt: 0.5,
                  pb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: "background.default",
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <IconButton
                      onClick={handleChangeBook}
                      aria-label="Back to your shelf"
                    >
                      <ArrowBackRoundedIcon />
                    </IconButton>
                  </motion.div>
                  <Book book={selectedBook} width={"56px"} height={"80px"} />
                  <div className="min-w-0 flex-1">
                    <div className="font-soft font-bold text-base truncate">
                      {selectedBook.title}
                    </div>
                    <div className="font-soft text-sm text-zinc-500 dark:text-zinc-400 truncate mb-1.5">
                      {selectedBook.author}
                    </div>
                    <ReadingStatusChip
                      value={displayedStatus}
                      onChange={handleStatusChange}
                      onDelete={handleDeleteReading}
                      canDelete={!!selectedReading}
                      disabled={changingStatus || loadingReadings}
                    />
                  </div>
                </Box>
              </Box>

              <Divider sx={{ mt: 2, mb: 1 }} />

              <div className="mt-3">
                {loadingDrafts ? (
                  <div className="flex justify-center items-center min-h-[150px]">
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  <ReadingRegister
                    key={`${selectedBook.bookId}-${discardVersion}`}
                    book={selectedBook}
                    reading={selectedReading}
                    statusType="DONE"
                    initialValues={
                      selectedDraft && {
                        rate: selectedDraft.rate,
                        thoughts: selectedDraft.thoughts,
                        recommended: selectedDraft.recommended,
                      }
                    }
                    onDraftChange={handleDraftChange}
                    updated={clearDraftAndSelection}
                    draftStatusSlot={
                      <span className="flex items-center gap-3 font-soft text-zinc-500 dark:text-zinc-400 hover:no-underline">
                        <span
                          className={`hover:no-underline ${draftStatus === "error" ? "text-red-500" : ""}`}
                        >
                          {draftLabel}
                        </span>
                        {selectedDraft && (
                          <button
                            type="button"
                            className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
                            onClick={handleDiscardDraft}
                          >
                            Discard
                          </button>
                        )}
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          )}
        </Box>
      </motion.div>
    </div>
  );
};
