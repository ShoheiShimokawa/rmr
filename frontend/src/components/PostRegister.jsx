import { findReadingByUser } from "../api/reading";
import { registerBook } from "../api/book";
import { useContext, useEffect, useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import { CustomDialog } from "../ui/CustomDialog";
import { BookArray } from "./book/BookArray";
import SearchIcon from "@mui/icons-material/Search";
import { ReadingRegister } from "./ReadingRegister";
import { BookSearch } from "./book/BookSearch";
import { BookWithDesc } from "./book/BookWithDesc";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";

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
      <div className="flex">
        <div className="w-full">
          <div className="mr-3">
            {recently.length >= 1 && (
              <>
                <div className="mb-2 font-soft font-bold">Recently</div>
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
          <div className="flex items-center mt-1">
            <div className="font-soft">Select a book to review</div>
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </div>
          <div className="mt-2">
            {selectedBook && <BookWithDesc book={selectedBook} />}
          </div>
          <div className="mt-4 mb-2">
            <ReadingRegister
              book={selectedBook && selectedBook}
              reading={selectedReading && selectedReading}
              updated={() => {
                find();
                setSelectedBook(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
