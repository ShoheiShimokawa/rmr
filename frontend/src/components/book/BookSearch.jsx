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
import { motion } from "framer-motion";
import { Chip, Card, CardContent } from "@mui/material";
import { useNotify } from "../../hooks/NotifyProvider";

/**
 * ブラウザのlocale(例: "ja-JP")から地域コード(例: "JP")を推定する。
 * Google Books APIのcountryパラメータは入手可否・版元情報の絞り込みであり、
 * 言語のランキングには影響しない(言語を絞るにはlangRestrictが別途必要)。
 */
const getCountryCodeFromLanguage = (lang) => {
  lang = lang || navigator.language;
  const parts = lang.split("-");
  if (parts.length === 2 && parts[1].length === 2) {
    return parts[1].toUpperCase();
  }
  return "JP";
};

/**
 * ブラウザのlocale(例: "ja-JP")から言語コード(例: "ja")を推定する。
 * Google Books APIのlangRestrictに渡し、検索結果を言語で絞り込む。
 */
const getLanguageCodeFromLocale = (lang) => {
  lang = lang || navigator.language;
  const parts = lang.split("-");
  return parts[0] ? parts[0].toLowerCase() : "ja";
};

/**
 * 検索結果を、優先言語(preferredLanguage)に一致する本が先に来るよう並べ替える。
 * Google Books APIのlangRestrictは指定してもGoogle側で無視されることがあるため、
 * 取得後にクライアント側で確実に反映させるためのソート。関連度順(元の並び)は
 * 同じ言語同士の本の中では保たれる(Array#sortは安定ソート)。
 */
export const sortByLanguagePreference = (items, preferredLanguage) => {
  const score = (item) => (item?.language === preferredLanguage ? 0 : 1);
  return [...items].sort((a, b) => score(a) - score(b));
};

export const BookSearch = ({ fromPost }) => {
  const [query, setQuery] = useState("");
  const { notify } = useNotify();
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [myReadings, setMyReadings] = useState([]);
  const [myReading, setMyReading] = useState();
  const [open, setOpen] = useState(false);
  const [iniSearch, setIniSearch] = useState(false);
  // ログイン状態に関係なく、ブラウザのlocaleから一度だけ算出する
  // (以前はログイン時にしか算出しておらず、未ログイン時の検索でcountryが
  // 送られず壊れていた)。セッション中に変わるものではないのでsetterは使わない
  const [country] = useState(() => getCountryCodeFromLanguage());
  const [langRestrict] = useState(() => getLanguageCodeFromLocale());

  const handleOpenDetail = (selectedBook) => {
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
    setSelectedBook(book);
    const reading = judgeRead(selectedBook);
    setMyReading(reading);
    setOpen(true);
  };

  const handleCloseDetail = () => {
    setOpen(false);
  };

  const judgeRead = (book) => {
    const a = myReadings.find((b) => {
      if (book.isbn && b.book.isbn) {
        return b.book.isbn === book.isbn;
      }
      return b.book.id === book.sourceId;
    });
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
      const result = await findBooks(query, country, langRestrict);
      const items = result.data.items || [];
      setBooks(sortByLanguagePreference(items, langRestrict));
      setIniSearch(true);
    } catch (error) {
      notify("Failed to search books.", "error");
    } finally {
      setLoading(false);
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
                  <motion.div key={book.sourceId} whileTap={{ scale: 0.98 }}>
                    <Card
                      className="cursor-pointer"
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
                          <div className="flex-shrink-0">
                            <Book src={book.thumbnail} />
                          </div>
                          <div className="ml-2 text-sm">
                            <div className="font-soft">{book.title}</div>
                            <div className="text-zinc-500 mt-2 text-sm font-soft">
                              {book.author || ""}
                            </div>
                            <div className="mt-3 font-soft">
                              {judgeRead(book)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="font-soft text-center text-sm text-zinc-600">
                No results were found. Try fewer keywords, check for typos,
                or search using the original title.
              </div>
            )}
          </>
        )}
      </>
    </div>
  );
};
