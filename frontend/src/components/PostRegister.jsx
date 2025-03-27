import { registerReading, findReadingByUser } from "../api/reading";
import { useContext, useEffect, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { IconButton } from "@mui/material";
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
import { BookSearch } from "./BookSearch";
import { BookDetail } from "./BookDetail";
import { statusTypeStr, judgeIcon } from "../badge/index";
import UserContext from "./UserProvider";

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
    setIsFromPost(true);
    setOpen(true);
  };

  const fromPost = (something) => {
    setAddedBook(something.volumeInfo && something.volumeInfo);
    console.log(addedBook);
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
      <IconButton component={Link} to="/posts" size="small">
        <ArrowBackIosNewRoundedIcon />
      </IconButton>
      <div className="flex">
        <div className="w-6/12">
          <div className="flex">
            <div>In my bookshelf...</div>
            <div>
              <IconButton>
                <SearchIcon onClick={handleSearch} />
              </IconButton>
            </div>
          </div>
          <div className="flex">
            <BookArray books={recent && recent} handleSelect={handleSelect} />
          </div>
          <div className="ml-2">
            {addedBook && (
              <Box
                component="img"
                src={
                  addedBook.imageLinks
                    ? addedBook.imageLinks.thumbnail
                    : addedBook.imageLinks.smallThumbnail
                }
              />
            )}
          </div>
          <div className="mt-4">
            <ReadingRegister
              book={selectedBook && selectedBook}
              reading={selectedReading && selectedReading}
            />
          </div>
        </div>
        <div className="w-4/12">
          <BookDetail book={selectedBook} />
        </div>
      </div>
    </div>
  );
};
