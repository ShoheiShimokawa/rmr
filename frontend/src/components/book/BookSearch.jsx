import React, { useState, useEffect, useCallback } from "react";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { findBooks } from "../../api/book";
import { Paper, CircularProgress } from "@mui/material";
import { Book } from "./Book";
import { isBlank } from "../../util";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { findReadingByUser } from "../../api/reading";
import { genreToEnum } from "../../util";
import { BookDetail } from "./BookDetail";
import { CustomDialog } from "../../ui/CustomDialog";

import { Chip, Card, CardContent } from "@mui/material";

export const BookSearch = ({ fromPost }) => {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [myReadings, setMyReadings] = useState([]);
  const [myReading, setMyReading] = useState();
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
      thumbnail: selectedBook?.volumeInfo?.imageLinks?.thumbnail,
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
    !isBlank(query) && searchBooks();
  };

  const handleKeyDown = (event) => {
    if (!isBlank(query) && event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const find = useCallback(async () => {
    if (user) {
      const myR = await findReadingByUser(user && user.userId);
      setMyReadings(myR.data);
    }
  }, [user]);

  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      <CustomDialog open={open} title="detail" onClose={handleCloseDetail}>
        <BookDetail reading={myReading} book={selectedBook} />
      </CustomDialog>
      <div className="text-2xl font-soft font-bold ml-4 mt-4 mb-4 flex justify-center">
        Explore Books📚
      </div>
      <div className="my-1">
        <form style={{ maxWidth: "400px", margin: "0 auto" }}>
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              mb: 2,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search by Title or Author"
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
        <div className="flex justify-center items-center min-h-[300px]">
          <CircularProgress />
        </div>
      )}
      <>
        {!iniSearch ? (
          <div></div>
        ) : (
          <>
            {books && books.length >= 1 ? (
              <div className="container mx-auto space-y-2">
                {books.map((book) => (
                  <Card
                    className="cursor-pointer"
                    key={book.id}
                    sx={{
                      maxWidth: 800,
                      transition: "0.3s ease",
                      "&:hover": {
                        filter: "brightness(0.9)",
                      },
                    }}
                    onClick={() =>
                      !fromPost ? handleOpenDetail(book) : fromPost(book)
                    }
                  >
                    <CardContent>
                      <div className="flex gap-6">
                        <Book src={book.volumeInfo?.imageLinks?.thumbnail} />

                        <div className="ml-2 text-sm">
                          <div className="font-soft">
                            {book.volumeInfo.title}
                          </div>
                          <div className="text-zinc-500 mt-2 text-sm font-soft">
                            {book.volumeInfo.authors
                              ? book.volumeInfo.authors[0]
                              : ""}
                          </div>
                          <div className="mt-3 font-soft">
                            {judgeRead(book)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="font-soft">
                No results were found for your search.
              </div>
            )}
          </>
        )}
      </>
    </div>
  );
};
