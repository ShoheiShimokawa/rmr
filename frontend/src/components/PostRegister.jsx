import { findReadingByUser } from "../api/reading";
import { registerBook } from "../api/book";
import { useContext, useEffect, useState, useCallback } from "react";
import { IconButton, Box } from "@mui/material";
import { CustomDialog } from "../ui/CustomDialog";
import { BookArray } from "./book/BookArray";
import SearchIcon from "@mui/icons-material/Search";
import { ReadingRegister } from "./ReadingRegister";
import { BookSearch } from "./book/BookSearch";
import { BookWithDesc } from "./book/BookWithDesc";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";
import { motion } from "framer-motion";

export const PostRegister = () => {
  const { user } = useContext(UserContext);
  const [readings, setReadings] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const recently = readings.filter((r) => {
    return r.statusType === "NONE" || r.statusType === "DOING";
  });

  const find = useCallback(async () => {
    const result = await findReadingByUser(user.userId);
    setReadings(result.data);
  }, [user]);

  const handleSelect = (selectedReading) => {
    setSelectedReading(selectedReading);
    setSelectedBook(selectedReading.book);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearch = () => {
    setOpen(true);
  };

  const fromPost = async (selectedBook) => {
    const isbn = selectedBook.volumeInfo.industryIdentifiers
      ? selectedBook.volumeInfo.industryIdentifiers.filter(
          (id) => id.type === "ISBN_13"
        )
      : "";
    const author = selectedBook.volumeInfo.authors
      ? selectedBook.volumeInfo.authors[0]
      : "";
    const genre = selectedBook.volumeInfo?.categories
      ? selectedBook.volumeInfo.categories[0]
      : "";
    const book = {
      isbn: isbn.identifier ? isbn.identifier : "",
      id: selectedBook.id,
      title: selectedBook.volumeInfo.title && selectedBook.volumeInfo.title,
      author: author,
      genre: genreToEnum(genre),
      description: selectedBook.volumeInfo.description,
      thumbnail: selectedBook.volumeInfo.imageLinks.thumbnail,
      publishedDate: selectedBook.volumeInfo.publishedDate,
    };
    const result = await registerBook(book);
    setSelectedBook(result.data);
    setSelectedReading(null);
    setOpen(false);
  };

  useEffect(() => {
    find();
  }, [find]);
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
            backgroundColor: "white",
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
                {recently.length >= 1 && (
                  <>
                    <div className="mb-2 ml-1 font-soft font-bold text-stone-800">
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
              <div className="mt-4 mb-5">
                <ReadingRegister
                  book={selectedBook && selectedBook}
                  reading={selectedReading && selectedReading}
                  updated={() => {
                    find();
                    setSelectedBook(null);
                    setSelectedReading(null);
                  }}
                />
              </div>
            </div>
          </div>
        </Box>
      </motion.div>
    </div>
  );
};
