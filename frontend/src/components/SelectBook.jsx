import { CustomDialog } from "../ui/CustomDialog";
import { BookShelf } from "./book/BookShelf";
import { useState, useEffect, useMemo } from "react";
import { useContext } from "react";
import { GiBookshelf } from "react-icons/gi";
import { BookInfo } from "../components/book/BookInfo";
import UserContext from "./UserProvider";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button,
  Slide,
} from "@mui/material";
import { getByUserIdAndBookId } from "../api/reading";

export const SelectBook = ({ onClick }) => {
  const [openBookShelf, setOpenBookShelf] = useState(false);
  const [selectedBook, setSelectedBook] = useState();
  const [selectedReading, setSelectedReading] = useState(null);
  const { user } = useContext(UserContext);

  const handleOpenBookShelf = () => {
    setOpenBookShelf(true);
  };

  const handleCloseBookShelf = () => {
    setOpenBookShelf(false);
  };

  const find = async () => {
    const result = await getByUserIdAndBookId(
      user.userId,
      selectedBook && selectedBook.bookId
    );
    setSelectedReading(result.data);
  };
  return (
    <div>
      <CustomDialog
        open={openBookShelf}
        title="My Bookshelf"
        onClose={handleCloseBookShelf}
      >
        <BookShelf
          account={user}
          onClick={(selectedBook) => {
            setSelectedBook(selectedBook);

            setOpenBookShelf(false);
            getByUserIdAndBookId(user.userId, selectedBook.bookId)
              .then((res) => {
                setSelectedReading(res.data); // 存在すればセット
              })
              .catch((err) => {
                setSelectedReading(null); // 存在しない or 204 の場合
              });
          }}
        />
      </CustomDialog>
      <div className="font-bold mb-2">Select a Book 📖</div>
      <div className="flex">
        <Button
          variant="contained"
          endIcon={<GiBookshelf />}
          onClick={handleOpenBookShelf}
          sx={{
            textTransform: "none",
            backgroundColor: "#000",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
        >
          from my bookshelf
        </Button>
      </div>
      <div className="mt-4">
        {selectedBook ? (
          <BookInfo book={selectedBook} />
        ) : (
          <Box sx={{ height: "135px", width: "100%" }} />
        )}
      </div>
      {selectedReading ? (
        <div>{selectedReading.statusType}</div>
      ) : (
        <div>reading now.</div>
      )}
      <div className="mt-4">
        <Button
          variant="contained"
          endIcon={<GiBookshelf />}
          onClick={onClick && onClick}
          sx={{
            textTransform: "none",
            backgroundColor: "#000",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
