import { registerReading, findReadingByUser } from "../api/reading";
import { registerBook } from "../api/book";
import { Box, Divider } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { Book } from "./book/Book";
import { CustomDialog } from "../ui/CustomDialog";
import { BookArray } from "./book/BookArray";
import SearchIcon from "@mui/icons-material/Search";
import { ReadingRegister } from "./ReadingRegister";
import { BookSearch } from "./book/BookSearch";
import { BookDetail } from "./book/BookDetail";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";

export const PostRegister = () => {
  const { user } = useContext(UserContext);
  const [readings, setReadings] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addedBook, setAddedBook] = useState();

  const none = readings.filter((r) => {
    return r.statusType === "NONE";
  });

  const doing = readings.filter((r) => {
    return r.statusType === "DOING";
  });

  const find = async () => {
    const result = await findReadingByUser(user.userId);
    setReadings(result.data);
  };

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

    setAddedBook(result && result.data);
    setSelectedBook(result.data);
    setOpen(false);
  };

  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <CustomDialog open={open} title="search" onClose={handleClose}>
        <BookSearch fromPost={fromPost} />
      </CustomDialog>
      <div className="flex">
        <div className="flex-[2]">
          <div className="w-[400px]">
            {none.length >= 1 && (
              <>
                <div className="mb-2 font-soft font-bold">To Read</div>
                <div className="w-[400px] overflow-x-auto">
                  <BookArray books={none && none} handleSelect={handleSelect} />
                </div>
              </>
            )}
            {doing.length >= 1 && (
              <>
                <div className="mt-3 mb-2 font-soft font-bold">
                  Reading Now..
                </div>
                <div className="w-[400px] overflow-x-auto space-y-2">
                  <BookArray
                    books={doing && doing}
                    handleSelect={handleSelect}
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center">
            <div className="font-soft">Select a book to review</div>
            <IconButton>
              <SearchIcon onClick={handleSearch} />
            </IconButton>
          </div>
          <div className="ml-2">{addedBook && <Book book={addedBook} />}</div>
          <div className="mt-4">
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

        <div className="ml-6 mt-5 min-w-[400px]">
          {selectedBook && <BookDetail book={selectedBook} visible={false} />}
        </div>
      </div>
    </div>
  );
};
