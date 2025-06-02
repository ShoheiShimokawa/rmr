import { useContext, useState } from "react";
import { Avatar, Rating, List, IconButton } from "@mui/material";
import { formatDateTime } from "../util";
import { useRequireLogin } from "../hooks/useRequireLogin";
import { Link } from "react-router-dom";
import { BookDetail } from "./book/BookDetail";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { good, deleteGood } from "../api/post";
import UserContext from "./UserProvider";
import { BookInfo } from "../components/book/BookInfo";
import { CustomDialog } from "../ui/CustomDialog";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNotify } from "../hooks/NotifyProvider";
import { useLocation } from "react-router-dom";

export const Post = ({
  post,
  visible,
  fromDetail,
  isInitiallyGooded = false,
}) => {
  const { user } = useContext(UserContext);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState();
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [open, setOpen] = useState(false);
  const [isGooded, setIsGooded] = useState(isInitiallyGooded);
  const [localGoodCount, setLocalGoodCount] = useState(post.goodCount || 0);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { notify } = useNotify();
  const location = useLocation();

  const handleClick = (selectedHandle) => {
    const origin = window.location.origin;
    const newUrl = `${origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };

  const handleGood = async () => {
    if (isLoggedIn()) {
      try {
        setIsGooded(true);
        setLocalGoodCount((prev) => prev + 1);
        if (user) {
          const param = {
            postId: post.postId,
            userId: user.userId,
          };
          const result = await good(param);
        }
      } catch (error) {
        notify("You already good for this post.", "error");
        setIsGooded(false);
        setLocalGoodCount((prev) => prev - 1);
      }
    }
  };
  const handleDelete = async () => {
    if (isLoggedIn()) {
      setIsGooded(false);
      setLocalGoodCount((prev) => prev - 1);
      if (user) {
        const param = {
          postId: post.postId,
          userId: user.userId,
        };
        const result = await deleteGood(param);
      }
    }
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
  };

  const handleOpenUpdate = () => {
    setOpenUpdate(true);
    handleClose();
  };

  return (
    <>
      {showLoginDialog && <LoginDialog />}
      <CustomDialog
        open={showBookDetail}
        title="Detail"
        onClose={handleCloseBookDetail}
      >
        <BookDetail book={selectedBook} />
      </CustomDialog>
      {post && post.user && (
        <List>
          <div key={post.postId} className="w-xl flex ">
            <div className="mr-2">
              {!fromDetail ? (
                <Link
                  to={`/${post.user.handle}`}
                  style={{ textDecoration: "none" }}
                >
                  <Avatar src={post.user.picture} />
                </Link>
              ) : (
                <Avatar
                  src={post.user && post.user.picture}
                  onClick={() => {
                    handleClick(post.user.handle && post.user.handle);
                  }}
                />
              )}
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <div className="text-sm font-soft font-bold">
                    {post.user.name}
                  </div>
                  <div className="text-sm text-zinc-500 font-soft">
                    {post.user.handle}
                  </div>
                </div>

                {/* {user && user.userId === post.user.userId && (
                  <> */}
                {/* <IconButton
                      aria-label="more"
                      size="small"
                      onClick={handleOpen}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      className="absolute bottom-0"
                      id="long-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
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
                    </Menu> */}
                {/* </>
                )} */}
              </div>
              <div className="flex gap-6">
                {post.reading && (
                  <>
                    <div>
                      {post.reading.rate != 0 && (
                        <Rating
                          className="mt-2"
                          name="read-only"
                          value={post.reading.rate}
                          size="small"
                          readOnly
                          sx={{
                            "& .MuiRating-icon": {
                              fontSize: "15px",
                            },
                          }}
                        />
                      )}
                      <div className="text-sm mt-1 font-soft">
                        {post.reading.thoughts}
                      </div>
                      {visible && (
                        <>
                          <div className="mt-3"></div>
                          <BookInfo
                            book={post.reading.book}
                            onClick={() => {
                              handleShowBookDetail(post.reading.book);
                            }}
                          />
                        </>
                      )}
                      <div className="flex items-center mt-1">
                        <IconButton
                          onClick={() => {
                            if (isGooded) {
                              handleDelete();
                            } else {
                              handleGood();
                            }
                          }}
                        >
                          {!isGooded ? (
                            <FavoriteBorderIcon
                              sx={{ fontSize: "16px" }}
                              color="error"
                              fontSize="small"
                            />
                          ) : (
                            <FavoriteIcon
                              sx={{ fontSize: "16px" }}
                              color="error"
                              fontSize="small"
                            />
                          )}
                        </IconButton>

                        <div className="text-xs font-soft">
                          {localGoodCount}
                        </div>
                      </div>
                      <div className="flex text-xs text-zinc-500 font-soft ">
                        <div>(last updated: </div>
                        {formatDateTime(
                          post.updateDate ? post.updateDate : post.registerDate
                        )}
                        )
                      </div>
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
