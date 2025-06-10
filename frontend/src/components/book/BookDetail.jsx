import { Book } from "./Book";
import { Post } from "../Post";
import { getGoodPostAll } from "../../api/post";
import { CustomDialog } from "../../ui/CustomDialog";
import { useNotify } from "../../hooks/NotifyProvider";
import { FaPenNib } from "react-icons/fa";
import React, { useState, useEffect, useCallback } from "react";
import { ReadingTimeline } from "../ReadingTimeline";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { GiBookshelf } from "react-icons/gi";
import { CollapsibleText } from "../CollapsibleText";
import { registerReading, findReadingById } from "../../api/reading";
import { Menu, MenuItem } from "@mui/material";
import { registerBook } from "../../api/book";
import { findPostByBookId } from "../../api/post";
import { deleteReading, toDoing } from "../../api/reading";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { enumToGenre } from "../../util";
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
  CircularProgress,
} from "@mui/material";
import { ReadingRegister } from "../ReadingRegister";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";

export const BookDetail = ({ book, updated, visible = true }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorAddEl, setAnchorAddEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const { user } = useContext(UserContext);
  const [bookForReading, setBookForReading] = useState();
  const [posts, setPosts] = useState([]);
  const [myReading, setMyReading] = useState();
  const [doing, setDoing] = useState([]);
  const [done, setDone] = useState([]);
  const { notify } = useNotify();
  const [openAdd, setOpenAdd] = useState(false);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const [goodPostIds, setGoodPostIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpenAdd = (event) => {
    if (!isLoggedIn()) return;
    setAnchorAddEl(event.currentTarget);
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
    setAnchorAddEl(null);
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
  const handleDoneReading = async () => {
    if (!isLoggedIn()) return;
    try {
      if (myReading) {
        handleRegister();
        updated && updated();
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
        updated && updated();
      } catch (error) {
        notify("Failed to delete this book.", "error");
      }
    }
  };

  const handleRegisterWithNone = async () => {
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
          statusType: "NONE",
        };
        await registerReading(rParam);
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
    } catch (error) {
      notify("Failed. Please try again.", "error");
    }
  };

  const handleRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
    if (anchorEl != null) {
      handleClose();
    } else if (anchorAddEl != null) {
      handleCloseAdd();
    }
    find();
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const postsWithThoughts = posts.filter(
    (post) =>
      (post.reading && post.reading.thoughts) ||
      (post.reading && post.reading.rate)
  );

  const find = useCallback(async () => {
    setLoading(true);
    try {
      var result = await findPostByBookId(book.id && book.id);
      setPosts(result.data);
      var iniReadings = await findReadingById(book.id && book.id);
      iniReadings &&
        user &&
        setMyReading(
          iniReadings.data.find((r) => r.user.userId === user.userId)
        );
      iniReadings &&
        setDoing(iniReadings.data.filter((r) => r.statusType === "DOING"));
      iniReadings &&
        setDone(iniReadings.data.filter((r) => r.statusType === "DONE"));
      const goodList = await getGoodPostAll(user && user.userId);
      const likedIds = goodList.data.map((g) => g.post.postId);
      setGoodPostIds(likedIds);
    } catch (error) {
      notify("Failed to loading. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [book.id, notify, user]);

  useEffect(() => {
    find();
  }, [find]);

  return (
    <div>
      {showLoginDialog && <LoginDialog />}

      <CustomDialog
        open={openRegister}
        title="Review"
        onClose={handleCloseRegister}
      >
        <ReadingRegister
          book={bookForReading}
          updated={() => {
            handleCloseRegister();
            updated && updated();
            find();
          }}
          reading={myReading && myReading}
        />
      </CustomDialog>
      <div className="flex">
        <Book book={book} width={"95px"} height={"137px"} />
        <div className="ml-2 text-lg text-zinc-800 font-bold font-soft">
          <div>{book.title}</div>
          <div className="text-zinc-500 mt-2 text-sm font-soft">
            {book.author}
          </div>
        </div>
      </div>
      <div className="text-sm font-sans mt-5 ml-1 font-soft">
        <CollapsibleText text={book.description} />
      </div>
      <div className="flex place-items-center  mt-2 ml-1 mb-1">
        <div className="text-xs mr-1 text-stone-600">Genre: </div>
        <Chip
          label={enumToGenre(book.genre)}
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
        <div className="ml-2 text-xs text-stone-600 font-soft">
          Published : {book.publishedDate ? book.publishedDate : "-"}
        </div>
      </div>
      <Divider />
      <div className="mt-2 mb-2">
        {loading ? (
          <div className="flex justify-center items-center min-h-[150px]">
            <CircularProgress size={20} />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start w-full font-soft font-bold">
              <div className="ml-1">Your Reading Timeline</div>
              {myReading && visible && (
                <IconButton aria-label="more" size="small" onClick={handleOpen}>
                  <ChangeCircleIcon />
                </IconButton>
              )}
            </div>
            <div className="mt-2  w-full flex justify-center">
              {myReading ? (
                <ReadingTimeline reading={myReading} />
              ) : (
                visible && (
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
                    <div className="text-sm text-zinc-700 font-soft">
                      Not on your Bookshelf yet.
                    </div>
                  </div>
                )
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
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      Completed!
                    </MenuItem>
                  </>
                ) : myReading.statusType === "DONE" ? (
                  <>
                    {!myReading.rate && !myReading.thoughts && (
                      <>
                        <MenuItem
                          onClick={() => {
                            handleDoneReading();
                            handleClose();
                          }}
                        >
                          <ListItemIcon>
                            <div className="ml-1">
                              <FaPenNib fontSize="small" color="error" />
                            </div>
                          </ListItemIcon>
                          <div className="font-soft">review</div>
                        </MenuItem>
                        <Divider />
                      </>
                    )}
                    <MenuItem
                      onClick={() => {
                        handleDelete();
                        handleClose();
                      }}
                    >
                      <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      <div className="font-soft">Delete from bookshelf</div>
                    </MenuItem>
                  </>
                ) : myReading.statusType === "DOING" ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleDoneReading();
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      Completed!
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
                        handleDoneReading();
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      Completed!
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
              anchorEl={anchorAddEl}
              open={openAdd}
              onClose={handleCloseAdd}
            >
              <div>
                {!myReading && (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleRegisterWithNone();
                        handleCloseAdd();
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
                        handleCloseAdd();
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
                      }}
                    >
                      <ListItemIcon>
                        <CheckCircleIcon fontSize="small" />
                      </ListItemIcon>
                      Completed!
                    </MenuItem>
                  </>
                )}
              </div>
            </Menu>
          </>
        )}
      </div>
      <Divider />
      <div className="flex mt-4 mb-4 justify-evenly">
        <div className="flex place-items-center">
          {doing.length !== 0 ? (
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": {
                  width: 34,
                  height: 34,
                  fontSize: 16,
                },
              }}
            >
              {doing.map((reading) => (
                <Avatar
                  key={reading.readingId}
                  alt={reading.user.name}
                  src={reading.user.picture}
                />
              ))}
            </AvatarGroup>
          ) : (
            <div className="text-sm font-soft">no one</div>
          )}

          <div className="ml-1 text-sm font-soft">reading now.</div>
        </div>
        <div className="flex place-items-center">
          <div>
            {done.length !== 0 ? (
              <AvatarGroup
                max={3}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 34,
                    height: 34,
                    fontSize: 16,
                  },
                }}
              >
                {done.map((reading) => (
                  <Avatar alt={reading.user.name} src={reading.user.picture} />
                ))}
              </AvatarGroup>
            ) : (
              <div className="text-sm font-soft">no one</div>
            )}
          </div>
          <div className="ml-1 text-sm font-soft">read it.</div>
        </div>
      </div>
      <Divider />
      <div className="text-lg mb-2 mt-3 font-soft font-bold">
        Readers' comments
      </div>
      {postsWithThoughts.length >= 1 ? (
        <>
          {postsWithThoughts.map((post) => (
            <>
              <Box key={post.postId} sx={{ width: "95%", margin: "0 auto" }}>
                <Post
                  post={post}
                  fromDetail={true}
                  isInitiallyGooded={goodPostIds.includes(post.postId)}
                />
              </Box>
              <>
                {posts.length >= 2 && (
                  <Divider sx={{ width: "95%", margin: "0 auto" }} />
                )}
              </>
            </>
          ))}
        </>
      ) : (
        <div className="mt-2 flex justify-center text-stone-600 text-sm font-soft">
          no comments yet.
        </div>
      )}
    </div>
  );
};
