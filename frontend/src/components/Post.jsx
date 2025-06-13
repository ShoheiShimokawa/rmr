import { useContext, useState } from "react";
import {
  Avatar,
  Rating,
  List,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { formatDateTime } from "../util";
import { CollapsibleText } from "./CollapsibleText";
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
import { judgePostLabel } from "../badge/index";
import { ReadingRegister } from "./ReadingRegister";

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
  const [selectedPost, setSelectedPost] = useState();
  const [open, setOpen] = useState(false);
  const [isGooded, setIsGooded] = useState(isInitiallyGooded);
  const [localGoodCount, setLocalGoodCount] = useState(post.goodCount || 0);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { notify } = useNotify();

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
          await good(param);
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
        await deleteGood(param);
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

  const handleOpenUpdate = (selectedPost) => {
    setSelectedPost(selectedPost);
    setOpenUpdate(true);
    handleClose();
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
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
      <CustomDialog
        open={openUpdate}
        title="Edit Post"
        onClose={handleCloseUpdate}
      >
        <ReadingRegister
          reading={selectedPost && selectedPost.reading}
          updated={handleCloseUpdate}
          isRecommended={
            selectedPost && selectedPost.postType === "RECOMMENDED"
          }
        />
      </CustomDialog>
      {post && post.user && (
        <List>
          <div key={post.postId} className="w-full mx-auto flex group ">
            <div className="flex">
              <div className="mr-1">
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
            </div>
            <div className="w-full">
              <div className="flex justify-between items-start items-center w-full ml-1 ">
                <div>
                  <div className="flex items-center">
                    <div className="text-sm font-soft font-bold">
                      {post.user.name}
                    </div>
                    {visible && (
                      <div className="font-soft font-bold text-sm ml-2">
                        {judgePostLabel(post)}
                      </div>
                    )}
                  </div>
                  <div className="flex text-xs text-zinc-500 font-soft mt-1 mb-1">
                    <div>(last updated: </div>
                    {formatDateTime(
                      post.updateDate ? post.updateDate : post.registerDate
                    )}
                    )
                  </div>
                </div>
                {user && user.userId === post.user.userId && (
                  <>
                    <IconButton
                      aria-label="more"
                      size="small"
                      onClick={handleOpen}
                      sx={{
                        width: 22,
                        height: 22,
                        padding: 0.5,
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <Menu
                      className="absolute bottom-0"
                      id="long-menu"
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                    >
                      <div>
                        <MenuItem
                          onClick={() => {
                            handleOpenUpdate(post);
                          }}
                        >
                          edit
                        </MenuItem>
                      </div>
                    </Menu>
                  </>
                )}
              </div>
              <div>
                {post.reading && (
                  <>
                    <div>
                      {post.reading.rate !== 0 && (
                        <Rating
                          className="mt-2"
                          name="read-only"
                          value={post.reading.rate}
                          size="small"
                          readOnly
                          sx={{
                            "& .MuiRating-icon": {
                              fontSize: "14px",
                            },
                          }}
                        />
                      )}
                      <div className="text-sm mt-1 font-soft ">
                        <CollapsibleText
                          text={post.reading.thoughts}
                          maxLength={500}
                        />
                      </div>
                      {visible && (
                        <>
                          <div className="mt-2"></div>
                          <BookInfo
                            book={post.reading.book}
                            onClick={() => {
                              handleShowBookDetail(post.reading.book);
                            }}
                          />
                        </>
                      )}
                      <div className="flex items-center mt-1 ">
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
                              sx={{ fontSize: "15px" }}
                              className="text-zinc-600 hover:text-red-500 transition-colors duration-200"
                              fontSize="small"
                            />
                          ) : (
                            <FavoriteIcon
                              sx={{ fontSize: "15px" }}
                              className="text-red-500"
                              fontSize="small"
                            />
                          )}
                        </IconButton>

                        <div className="text-xs font-soft">
                          {localGoodCount}
                        </div>
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
