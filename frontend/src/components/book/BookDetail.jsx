import { Book } from "./Book";
import { Post } from "../Post";
import { CustomDialog } from "../../ui/CustomDialog";
import { useNotify } from "../../hooks/NotifyProvider";
import React, { useState, useEffect, useCallback } from "react";
import { ReadingTimeline } from "../ReadingTimeline";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { GiBookshelf } from "react-icons/gi";
import { CollapsibleText } from "../CollapsibleText";
import { registerReading, findReadingById } from "../../api/reading";
import { Menu, MenuItem, MenuIcon } from "@mui/material";
import { registerBook } from "../../api/book";
import { findPostByBookId } from "../../api/post";
import { deleteReading, toDoing } from "../../api/reading";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRequireLogin } from "../../hooks/useRequireLogin";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Button,
  Chip,
  Box,
  Divider,
  Avatar,
  AvatarGroup,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import { ReadingRegister } from "../ReadingRegister";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

export const BookDetail = ({ book, updated }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [bookForReading, setBookForReading] = useState();
  const [posts, setPosts] = useState([]);
  const [myReading, setMyReading] = useState();
  const [doing, setDoing] = useState([]);
  const [done, setDone] = useState([]);
  const { notify } = useNotify();
  const [openAdd, setOpenAdd] = useState(false);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();

  const handleOpenAdd = (event) => {
    if (!isLoggedIn()) return;
    setAnchorEl(event.currentTarget);
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleStartReading = async () => {
    if (!isLoggedIn()) return;
    try {
      if (myReading) {
        await toDoing(myReading.readingId);
        updated && updated();
        notify("Start reading!", "success");
        find();
      }
    } catch (error) {
      notify("Failure add this book to your bookshelf.", "error");
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn()) return;
    if (window.confirm("remove from bookshelf?")) {
      try {
        if (myReading) {
          await deleteReading(myReading.readingId);
          updated && updated();
        }
        notify("Success delete this from your bookshelf. ", "success");
        find();
      } catch (error) {
        notify("Failed to delete this book.", "error");
      }
    }
  };

  const handleRegisterWithNone = async () => {
    if (!isLoggedIn()) return;
    try {
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
        notify("Add want to read list.", "success");
        find();
      }
    } catch (error) {
      notify("Failed to add this book to your list.", "error");
    }
  };

  const handleRegisterWithDoing = async () => {
    if (!isLoggedIn()) return;
    try {
      const result = await registerBook(book);
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
        notify("Start reading!", "success");
        find();
      }
    } catch (error) {
      notify("Failed to add this book to your list.", "error");
    }
  };

  const handleRegisterWithDone = async () => {
    if (!isLoggedIn()) return;
    try {
      const result = await registerBook(book);
      setBookForReading(result.data);
      handleRegister();
      find();
    } catch (error) {
      notify("Failed. Please try again.", "error");
    }
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
      user &&
      setMyReading(iniReadings.data.find((r) => r.user.userId === user.userId));
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
      {showLoginDialog && <LoginDialog />}
      <CustomDialog
        open={openRegister}
        title="Review"
        onClose={handleCloseRegister}
      >
        <ReadingRegister book={bookForReading} updated={handleCloseRegister} />
      </CustomDialog>
      <div className="flex">
        <Book book={book} />
        <div className="ml-2 text-lg text-zinc-800 font-bold">
          <div>{book.title}</div>
          <div className="text-zinc-500 mt-2 text-sm ">{book.author}</div>
        </div>
      </div>
      <div className="text-sm font-sans mt-3 ml-1">
        <CollapsibleText text={book.description} />
      </div>
      <div className="flex place-items-center  mt-2 ml-1 mb-1">
        <div className="text-xs mr-1 text-stone-600">Genre: </div>
        <Chip
          label={book.genre}
          size="small"
          variant="outlined"
          sx={{
            "& .MuiChip-label": {
              fontSize: "0.65rem",
            },
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
      <div className="mt-1 mb-1">
        <div className="flex justify-between items-start w-full">
          <div className="">Your Reading Timeline</div>
          {myReading && (
            <IconButton aria-label="more" size="small" onClick={handleOpen}>
              <ChangeCircleIcon />
            </IconButton>
          )}
        </div>
        <div className="mt-2  w-full flex justify-center">
          {myReading ? (
            <ReadingTimeline reading={myReading} />
          ) : (
            <div>
              <div className="mt-1">
                <Button
                  variant="contained"
                  endIcon={<GiBookshelf />}
                  onClick={handleOpenAdd}
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
              <div className="text-sm text-zinc-700">
                Not on your Bookshelf yet.
              </div>
            </div>
          )}
        </div>
        <Menu
          className="absolute bottom-0"
          // id="long-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <div>
            {!myReading ? (
              <>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithNone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <BookmarkBorderIcon fontSize="small" />
                  </ListItemIcon>
                  Next in Line
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDoing();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  Reading
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Polished!
                </MenuItem>
              </>
            ) : myReading.statusType === "DONE" ? (
              <MenuItem
                onClick={() => {
                  handleDelete();
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete from bookshelf
              </MenuItem>
            ) : myReading.statusType === "DOING" ? (
              <>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Polished!
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleDelete();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Delete from bookshelf
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  onClick={() => {
                    handleStartReading();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  Reading now
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Polished!
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleDelete();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Delete from bookshelf
                </MenuItem>
              </>
            )}
          </div>
        </Menu>
        <Menu
          className="absolute bottom-0"
          anchorEl={anchorEl}
          open={openAdd}
          onClose={handleCloseAdd}
        >
          <div>
            {!myReading && (
              <>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithNone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <BookmarkBorderIcon fontSize="small" />
                  </ListItemIcon>
                  Next in Line
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDoing();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  Reading
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleRegisterWithDone();
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Polished!
                </MenuItem>
              </>
            )}
          </div>
        </Menu>
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
