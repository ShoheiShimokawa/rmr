import { Book } from "./Book";
import { Post } from "../Post";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Tooltip } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { RiBookShelfFill } from "react-icons/ri";
import { GiBookshelf } from "react-icons/gi";
import {
  findReadingByUser,
  registerReading,
  findReadingById,
} from "../../api/reading";
import { genreToEnum } from "../../util";
import { Menu, MenuItem, MenuIcon } from "@mui/material";
import { FaBook } from "react-icons/fa";
import { registerBook } from "../../api/book";
import { findPostByBookId } from "../../api/post";
import { deleteReading, toDoing } from "../../api/reading";
import { useMessage } from "../../ui/useMessage";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Box,
  Divider,
  Avatar,
  AvatarGroup,
  ListItem,
  List,
} from "@mui/material";
import { ReadingRegister } from "../ReadingRegister";

export const BookDetail = ({ reading, book, updated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { showMessage, AlertComponent } = useMessage();
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [bookForReading, setBookForReading] = useState();
  const [posts, setPosts] = useState([]);
  const [doing, setDoing] = useState([]);
  const [done, setDone] = useState([]);

  const handleStartReading = async () => {
    const readingId = reading.readingId;
    await toDoing(readingId);
    updated && updated();
  };

  const handleDelete = async () => {
    if (window.confirm("remove from bookshelf?")) {
      const readingId = reading.readingId;
      await deleteReading(readingId);
      updated && updated();
      showMessage("test");
    }
  };

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

  const find = async () => {
    var result = await findPostByBookId(book.id && book.id);
    setPosts(result.data);
    var iniReadings = await findReadingById(book.id && book.id);
    iniReadings &&
      setDoing(iniReadings.data.filter((r) => r.statusType === "DOING"));
    iniReadings &&
      setDone(iniReadings.data.filter((r) => r.statusType === "DONE"));
  };

  useEffect(() => {
    find();
  }, []);

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
        <Book book={book} />
        <div className="ml-3">
          <div className="text-lg"> {book.title && book.title}</div>
          <div className="mt-1">{book.author}</div>
        </div>
      </div>
      <div>
        <div className="mt-3 mb-1">
          <Button
            variant="contained"
            endIcon={<GiBookshelf />}
            onClick={handleOpen}
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
      </div>
      <div className="text-sm font-sans mt-4 ml-1">{book.description}</div>
      <div className="flex place-items-center  mt-2 ml-1 mb-1">
        <div className="text-xs mr-1 text-stone-600">Genre: </div>
        <Chip
          label={book.genre}
          size="small"
          sx={{
            "&:hover .MuiChip-label": {
              textDecoration: "none",
            },
          }}
        />
        <div className="ml-2 text-xs text-stone-600">
          Published : {book.publishedDate ? book.publishedDate : "-"}
        </div>
      </div>
      <Divider />

      <div className="flex mt-2 mb-4 justify-evenly">
        <div className="flex place-items-center">
          {doing.length !== 0 ? (
            doing.map((reading) => (
              <AvatarGroup
                max={4}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 34,
                    height: 34,
                    fontSize: 16,
                  },
                }}
              >
                <Avatar alt={reading.user.name} src={reading.user.picture} />
              </AvatarGroup>
            ))
          ) : (
            <div className="text-sm">no one</div>
          )}

          <div className="ml-1 text-sm">reading now.</div>
        </div>
        <div className="flex place-items-center">
          <div>
            {done.length !== 0 ? (
              done.map((reading) => (
                <AvatarGroup
                  max={4}
                  sx={{
                    "& .MuiAvatar-root": {
                      width: 34,
                      height: 34,
                      fontSize: 16,
                    },
                  }}
                >
                  <Avatar alt={reading.user.name} src={reading.user.picture} />
                </AvatarGroup>
              ))
            ) : (
              <div className="text-sm">no one</div>
            )}
          </div>
          <div className="ml-1 text-sm">read it.</div>
        </div>
      </div>
      <div className="text-lg mb-2 mt-3">Readers' comments</div>
      {posts.length >= 1 ? (
        <>
          {posts.map((post) => (
            <>
              <Post post={post} fromDetail={true} />

              {posts.length >= 2 && <Divider />}
            </>
          ))}
        </>
      ) : (
        <div className="mt-2 flex justify-center text-stone-600 text-sm">
          no reviews yet.
        </div>
      )}
    </div>
  );
};
