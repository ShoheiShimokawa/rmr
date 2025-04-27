import { BookDetail } from "./BookDetail";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Tooltip } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../badge/index";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { RiBookShelfFill } from "react-icons/ri";
import { GiBookshelf } from "react-icons/gi";
import { findBooks } from "../api/book";
import { Paper, CircularProgress } from "@mui/material";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { findReadingByUser, registerReading } from "../api/reading";
import { genreToEnum } from "../util";
import { Menu, MenuItem, MenuIcon } from "@mui/material";
import { FaBook } from "react-icons/fa";
import { registerBook } from "../api/book";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Box,
} from "@mui/material";
import { ReadingRegister } from "./ReadingRegister";

export const BookSearchDetail = ({ reading, book, updated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [bookForReading, setBookForReading] = useState();

  const handleRegisterWithNone = async () => {
    const result = await registerBook(book);
    console.log("success registering book");
    if (result) {
      const rParam = {
        bookId: result.data.bookId,
        userId: user.userId,
        rate: 0,
        thoughts: "",
        description: "",
        statusType: "NONE",
      };
      const r = await registerReading(rParam);
      console.log("success");
    }
  };

  const handleRegisterWithDoing = async () => {
    const result = await registerBook(book);
    console.log("success registering book");
    if (result) {
      const rParam = {
        bookId: result.data.bookId,
        userId: user.userId,
        rate: 0,
        thoughts: "",
        description: "",
        statusType: "DOING",
      };
      await registerReading(rParam);
      console.log("success");
    }
  };

  const handleRegisterWithDone = async () => {
    const result = await registerBook(book);
    console.log("success registering book");
    setBookForReading(result.data);
    handleRegister();
  };

  const handleRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={openRegister}>
        <DialogTitle>Review</DialogTitle>
        <DialogContent>
          <ReadingRegister
            book={bookForReading}
            updated={handleCloseRegister}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseRegister()}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <div className="flex">
        <Box
          component="img"
          sx={{
            // width: "120px",
            // height: "170px",
            objectFit: "cover",
          }}
          src={book.thumbnail}
        />
        <div className="ml-3">
          <div> {book.title}</div>
          <div className="mt-2 text-sm">{book.author}</div>
          <br></br>
          <Chip
            label={book.genre}
            sx={{
              "&:hover .MuiChip-label": {
                textDecoration: "none",
              },
            }}
          />
          <div className="text-base text-stone-600">
            published : {book.publishedDate ? book.publishedDate : "unknown"}
          </div>
          <div>
            {/* <Tooltip title="add my bookshelf" arrow placement="top"> */}
            {/* <IconButton>
                <FaBook size={20} style={{ color: "black" }} />{" "}
              </IconButton> */}
            <div className="mt-5 ml-1">
              <Button
                variant="contained"
                endIcon={<GiBookshelf />}
                onClick={handleOpen}
                sx={{
                  textTransform: "none",
                  backgroundColor: "#000", // 黒
                  color: "#fff", // 文字は白
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#333", // ホバー時は少し明るめに
                  },
                }}
              >
                add bookshelf
              </Button>
            </div>
            <Menu
              className="absolute bottom-0"
              id="long-menu"
              MenuListProps={{
                "aria-labelledby": "long-button",
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              slotProps={{
                paper: {
                  style: {
                    width: "auto",
                  },
                },
              }}
            >
              <div>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithNone();
                    handleClose();
                  }}
                >
                  Next in Line
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDoing();
                    handleClose();
                  }}
                >
                  Reading
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDone();
                    handleClose();
                  }}
                >
                  Polished!
                </MenuItem>
              </div>
            </Menu>
            {/* </Tooltip> */}
          </div>
        </div>
      </div>

      <Divider sx={{ m: 0.5 }} />
      <div className="text-sm font-sans mt-2">{book.description}</div>
    </div>
  );
};
