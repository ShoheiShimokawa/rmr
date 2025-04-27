import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Tooltip, Box } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../badge/index";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { findBooks } from "../api/book";
import { Paper, CircularProgress } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { findReadingByUser, registerReading } from "../api/reading";
import { genreToEnum } from "../util";
import { BookSearchDetail } from "../components/BookSearchDetail";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from "@mui/material";

export const BookSearch = ({ fromPost }) => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [myReadings, setMyReadings] = useState([]);
  const [myReading, setMyReading] = useState();
  const [bookForReading, setBookForReading] = useState();
  const [open, setOpen] = useState(false);
  const [iniSearch, setIniSearch] = useState(false);

  const handleOpenDetail = (selectedBook) => {
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
      title: selectedBook.volumeInfo.title,
      author: author,
      genre: genreToEnum(genre),
      description: selectedBook.volumeInfo.description,
      thumbnail: selectedBook.volumeInfo.imageLinks.thumbnail,
      publishedDate: selectedBook.volumeInfo.publishedDate,
    };
    setSelectedBook(book);
    const reading = judgeRead(selectedBook);
    setMyReading(reading);
    setOpen(true);
  };

  const handleCloseDetail = () => {
    setOpen(false);
  };

  const judgeRead = (book) => {
    const a = myReadings.find((b) => b.book.id === book.id);
    if (a) {
      return (
        <Chip
          icon={judgeIcon(a.statusType)}
          label={statusTypeStr(a.statusType)}
          size="small"
        />
      );
    } else {
      return null;
    }
  };

  const searchBooks = async () => {
    try {
      setLoading(true);
      const result = await findBooks(query);
      setBooks(result.data.items);
      setIniSearch(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleSearch = () => {
    searchBooks();
  };

  const shrinkDescription = (description) => {
    return description.length <= 100
      ? description
      : description.substr(0, 100) + "...";
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const find = useCallback(async () => {
    if (user) {
      const myR = await findReadingByUser(user && user.userId);
      setMyReadings(myR.data);
    }
  }, [myReadings]);

  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <Dialog
        open={open}
        maxWidth={"md"}
        sx={{
          "& .MuiDialog-paper": {
            width: "700px", // 自由に設定
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>detail</DialogTitle>
        <DialogContent>
          <BookSearchDetail reading={myReading} book={selectedBook} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <div className="my-1">
        <form style={{ maxWidth: "400px", margin: "0 auto" }}>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: 400,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search by title or author"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              type="button"
              sx={{ p: "10px" }}
              aria-label="search"
              onClick={() => {
                handleSearch();
              }}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </form>
      </div>
      {loading && (
        <div className="absolute-center">
          <CircularProgress />
        </div>
      )}
      <>
        {!iniSearch ? (
          <div>initial </div>
        ) : (
          <>
            {books && books.length >= 1 ? (
              <div className="container mx-auto space-y-3">
                {books.map((book) => (
                  <Card
                    key={book.id}
                    sx={{ maxWidth: 800 }}
                    onClick={() =>
                      !fromPost ? handleOpenDetail(book) : fromPost(book)
                    }
                  >
                    <CardContent>
                      <div className="flex gap-6">
                        <Box
                          component="img"
                          src={book.volumeInfo.imageLinks?.thumbnail}
                        />
                        <div className="space-y-2">
                          <div>{book.volumeInfo.title}</div>
                          <div>
                            {book.volumeInfo.authors
                              ? book.volumeInfo.authors[0]
                              : ""}
                          </div>
                          <div>{judgeRead(book)}</div>
                          {/* <Divider sx={{ height: 20, m: 0.5 }} />
                                            <p className="text-sm">{book.volumeInfo.description && shrinkDescription(book.volumeInfo.description)}</p> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div>No results were found for your search.</div>
            )}
          </>
        )}
      </>
    </div>
  );
};
