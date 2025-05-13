import { useContext, useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Rating,
  Divider,
  ListItemAvatar,
  List,
  ListItemText,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Book } from "./book/Book";
import { Link } from "react-router-dom";
import { BookDetail } from "./book/BookDetail";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useMessage } from "../ui/useMessage";
import UserContext from "./UserProvider";

export const Post = ({ post, visible, fromDetail }) => {
  const { user } = useContext(UserContext);
  const [selectedPost, setSelectedPost] = useState();
  const [openUpdate, setOpenUpdate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState();
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const { showMessage, AlertComponent } = useMessage();
  const handleClick = (selectedHandle) => {
    const currentUrl = window.location.href;
    const newUrl = currentUrl + selectedHandle;
    window.open(newUrl, "_blank", "noopener,noreferrer");
  };

  const handleShowBookDetail = (selectedBook) => {
    setSelectedBook(selectedBook);
    setShowBookDetail(true);
  };

  const handleCloseBookDetail = () => {
    setShowBookDetail(false);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    showMessage("test");
  };

  const handleOpenUpdate = () => {
    setOpenUpdate(true);
    handleClose();
  };

  return (
    <>
      <Dialog
        onClose={handleCloseBookDetail}
        open={showBookDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detail</DialogTitle>
        <DialogContent>
          <BookDetail book={selectedBook} />
        </DialogContent>
      </Dialog>
      {post && (
        <List>
          <div key={post.postId} className="w-xl flex ">
            <div className="mr-2">
              {!fromDetail ? (
                <Link
                  to={`/${post.user.handle}`}
                  style={{ textDecoration: "none" }}
                >
                  <Avatar src={post.user.picture && post.user.picture} />
                </Link>
              ) : (
                <Avatar
                  src={post.user.picture && post.user.picture}
                  onClick={() => {
                    handleClick(post.user.handle && post.user.handle);
                  }}
                />
              )}
            </div>
            <div>
              <div className="flex relative">
                <div>
                  <div className="text-sm">{post.user.name}</div>
                  <div className="text-sm text-zinc-500 ">
                    {post.user.handle}
                  </div>
                </div>

                {user && user.userId === post.user.userId && (
                  <div className="absolute top-0 right-0">
                    <IconButton
                      aria-label="more"
                      id="long-button"
                      aria-controls={open ? "long-menu" : undefined}
                      aria-expanded={open ? "true" : undefined}
                      // aria-haspopup="true"
                      onClick={handleOpen}
                    >
                      <MoreVertIcon />
                    </IconButton>
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
                        <MenuItem>
                          <div
                            onClick={() => {
                              handleOpenUpdate();
                            }}
                          >
                            edit
                          </div>
                        </MenuItem>
                      </div>
                    </Menu>
                  </div>
                )}
              </div>
              <div className="flex gap-6">
                {post.reading && (
                  <>
                    <div>
                      {/* <Rating
                        className="mt-2"
                        name="read-only"
                        value={post.reading.rate}
                        size="small"
                        readOnly
                      /> */}
                      <div className="text-sm mt-1">
                        {post.reading.thoughts}
                      </div>

                      {visible && (
                        <div className="flex mt-3">
                          <Book
                            book={post.reading.book}
                            onClick={() => {
                              handleShowBookDetail(post.reading.book);
                            }}
                          />
                          <div className="ml-2 text-sm">
                            <div>{post.reading.book.title}</div>
                            <div className="text-zinc-500 mt-2 text-sm">
                              {post.reading.book.author}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* {goodPosts.length > 0 &&
                          !goodPosts.includes(post.postId) ? (
                            <IconButton
                              onClick={() => {
                                handleGood(post.postId);
                              }}
                            >
                              <FavoriteBorderRoundedIcon color="error" />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => {
                                handleCancel(post.postId);
                              }}
                            >
                              <FavoriteRoundedIcon color="error" />
                            </IconButton>
                          )} */}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </List>
      )}
    </>
  );
};
