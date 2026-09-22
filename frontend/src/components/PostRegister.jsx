import { registerBook } from "../api/book";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { IconButton, Box, CircularProgress } from "@mui/material";
import { CustomDialog } from "../ui/CustomDialog";
import { BookArray } from "./book/BookArray";
import { Book } from "./book/Book";
import SearchIcon from "@mui/icons-material/Search";
import { ReadingRegister } from "./ReadingRegister";
import { BookSearch } from "./book/BookSearch";
import { BookWithDesc } from "./book/BookWithDesc";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";
import { motion } from "framer-motion";
import { useReadingsByUser } from "../hooks/useReading";
import {
  draftStatusLabel,
  useReadingDraft,
  useReadingDrafts,
} from "../hooks/useReadingDraft";

export const PostRegister = () => {
  const { user } = useContext(UserContext);
  const userId = user?.userId;
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const restoredRef = useRef(false);

  const { data: readings = [] } = useReadingsByUser(userId);
  const { data: drafts = [], isLoading: loadingDrafts } = useReadingDrafts(userId);
  const { saveDraft, deleteDraft, status: draftStatus } = useReadingDraft(userId);

  const recently = readings.filter((r) => {
    return r.statusType === "NONE" || r.statusType === "DOING";
  });
  // 選択中の本に自分の読書が既にあればそれを使う(更新経路になる)
  const selectedReading = selectedBook
    ? readings.find((r) => r.book.bookId === selectedBook.bookId) ?? null
    : null;
  const selectedDraft = selectedBook
    ? drafts.find((d) => d.book.bookId === selectedBook.bookId)
    : undefined;
  const draftLabel = draftStatusLabel(draftStatus, !!selectedDraft);

  // 画面を開いたとき、書きかけの下書きがあれば最新のものを選択した状態にする(初回のみ)
  useEffect(() => {
    if (restoredRef.current || loadingDrafts) return;
    restoredRef.current = true;
    if (!selectedBook && drafts.length > 0) {
      setSelectedBook(drafts[0].book);
    }
  }, [drafts, loadingDrafts, selectedBook]);

  const handleSelect = (selectedReading) => {
    setSelectedBook(selectedReading.book);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearch = () => {
    setOpen(true);
  };

  const fromPost = async (selectedBook) => {
    const book = {
      id: selectedBook.sourceId,
      isbn: selectedBook.isbn,
      title: selectedBook.title,
      author: selectedBook.author,
      genre: genreToEnum(selectedBook.genre),
      description: selectedBook.description,
      thumbnail: selectedBook.thumbnail,
      publishedDate: selectedBook.publishedDate,
    };
    const result = await registerBook(book);
    setSelectedBook(result.data);
    setOpen(false);
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

  return (
    <div>
      <CustomDialog open={open} title="search" onClose={handleClose}>
        <BookSearch fromPost={fromPost} />
      </CustomDialog>
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
          <div className="text-2xl font-soft font-bold mb-2">
            Record Your Reading ✍🏻
          </div>
          <div className="flex">
            <div className="w-full">
              <div className="flex items-center mt-1">
                <div className="font-soft font-bold text-lg">Select a book</div>
                <IconButton onClick={handleSearch}>
                  <SearchIcon />
                </IconButton>
              </div>
              <div className="ml-2 mt-2 mb-4">
                {drafts.length >= 1 && (
                  <>
                    <div className="mb-2 ml-1 font-soft font-bold text-stone-800 dark:text-stone-200">
                      Drafts
                    </div>
                    <div className="w-full overflow-x-auto mb-3">
                      <div className="ml-2">
                        <div
                          className="flex overflow-x-auto gap-4"
                          style={{ minWidth: "max-content" }}
                        >
                          {drafts.map((draft) => (
                            <Book
                              key={draft.book.bookId}
                              book={draft.book}
                              onClick={() => setSelectedBook(draft.book)}
                              width={"70px"}
                              height={"100px"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {recently.length >= 1 && (
                  <>
                    <div className="mb-2 ml-1 font-soft font-bold text-stone-800 dark:text-stone-200">
                      Recently
                    </div>
                    <div className="w-full  overflow-x-auto">
                      <BookArray
                        books={recently && recently}
                        handleSelect={handleSelect}
                        width={"70px"}
                        height={"100px"}
                      />
                    </div>
                  </>
                )}
              </div>

              <motion.div
                key={selectedBook?.bookId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="mt-1">
                  {selectedBook && <BookWithDesc book={selectedBook} />}
                </div>
              </motion.div>
              {selectedBook && (
                <div className="mt-2 ml-1 text-xs font-soft text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                  <span
                    className={draftStatus === "error" ? "text-red-500" : ""}
                  >
                    {draftLabel}
                  </span>
                  {selectedDraft && (
                    <button
                      type="button"
                      className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
                      onClick={clearDraftAndSelection}
                    >
                      Discard
                    </button>
                  )}
                </div>
              )}
              <div className="mt-4 mb-5">
                {loadingDrafts ? (
                  <div className="flex justify-center items-center min-h-[150px]">
                    <CircularProgress size={20} />
                  </div>
                ) : (
                  <ReadingRegister
                    key={selectedBook?.bookId ?? "none"}
                    book={selectedBook && selectedBook}
                    reading={selectedReading && selectedReading}
                    initialValues={
                      selectedDraft && {
                        rate: selectedDraft.rate,
                        thoughts: selectedDraft.thoughts,
                        recommended: selectedDraft.recommended,
                      }
                    }
                    onDraftChange={handleDraftChange}
                    updated={clearDraftAndSelection}
                  />
                )}
              </div>
            </div>
          </div>
        </Box>
      </motion.div>
    </div>
  );
};
