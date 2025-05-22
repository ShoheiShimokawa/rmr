import { registerReading, findReadingByUser } from "../api/reading";
import { registerBook } from "../api/book";
import { useContext, useEffect, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { IconButton } from "@mui/material";
import { Book } from "./book/Book";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
} from "@mui/material";
import { BookArray } from "./book/BookArray";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { ReadingRegister } from "./ReadingRegister";
import { BookSearch } from "./book/BookSearch";
import { BookDetail } from "./book/BookDetail";
import { statusTypeStr, judgeIcon } from "../badge/index";
import UserContext from "./UserProvider";
import { genreToEnum } from "../util";

export const PostRegister = () => {
  const { user } = useContext(UserContext);
  const [reading, setReading] = useState();
  const [readings, setReadings] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isFromPost, setIsFromPost] = useState(false);
  const [addedBook, setAddedBook] = useState();

  const recent = readings.filter((r) => {
    return r.statusType === "NONE" || r.statusType === "DOING";
  });

  const onSubmit = async () => {
    const result = await registerReading(reading);
  };

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
    console.log("success register book!");
    setAddedBook(result && result.data);
    setSelectedBook(result.data);
    setOpen(false);
  };

  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <Dialog open={open} maxWidth={"md"}>
        <DialogTitle>search</DialogTitle>
        <DialogContent>
          <BookSearch fromPost={fromPost} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <div className="flex">
        <div className="flex-1">
          <div className="flex">
            <div>In my bookshelf...</div>
          </div>
          <div className="flex">
            {recent.length >= 1 ? (
              <BookArray books={recent && recent} handleSelect={handleSelect} />
            ) : (
              <div className="text-sm text-gray-600">
                Nothing in your reading or want-to-read bookshelf.
              </div>
            )}
          </div>
          <IconButton>
            <SearchIcon onClick={handleSearch} />
          </IconButton>
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

        <div className="flex-1">
          {selectedBook && <BookDetail book={selectedBook} />}
        </div>
      </div>
    </div>
  );
};
