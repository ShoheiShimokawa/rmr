import { useContext, useState } from "react";
import {
  Avatar,
  List,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { Review } from "./Review";
import { formatDateTime } from "../util";
import { motion } from "framer-motion";
import { useRequireLogin } from "../hooks/useRequireLogin";
import { Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useGoodMutation,
  useUnGoodMutation,
  useGoodPostIds,
} from "../hooks/usePost";
import UserContext from "./UserProvider";
import { CustomDialog } from "../ui/CustomDialog";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNotify } from "../hooks/NotifyProvider";
import { useTranslation } from "react-i18next";
import { judgePostLabel } from "../badge/index";
import { ReadingRegister } from "./ReadingRegister";
import { GoodDetail } from "./GoodDetail";

export const Post = ({ post, visible, fromDetail }) => {
  const { user } = useContext(UserContext);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState();
  const [selectedPostId, setSelectedPostId] = useState();
  const [OpenGooder, setOpenGooder] = useState(false);
  const [open, setOpen] = useState(false);
  const [localGoodCount, setLocalGoodCount] = useState(post.goodCount || 0);
  const { isLoggedIn, LoginDialog, showLoginDialog } = useRequireLogin();
  const { notify } = useNotify();
  const { t } = useTranslation();
  const goodMutation = useGoodMutation();
  const unGoodMutation = useUnGoodMutation();
  // 「いいね済みか」はキャッシュ由来で判定する。同じ投稿が別画面に同時表示されていても一致する。
  const { data: goodPostIds = [] } = useGoodPostIds(user?.userId);
  const isGooded = goodPostIds.includes(post.postId);

  const handleClick = (selectedHandle) => {
    const origin = window.location.origin;
    const newUrl = `${origin}/${selectedHandle}`;
    window.open(newUrl, "_blank");
  };

  const handleGood = async () => {
    if (isLoggedIn()) {
      try {
        setLocalGoodCount((prev) => prev + 1);
        if (user) {
          await goodMutation.mutateAsync({
            postId: post.postId,
            userId: user.userId,
          });
        }
      } catch (error) {
        notify(t("notify.alreadyLiked"), "error");
        setLocalGoodCount((prev) => prev - 1);
      }
    }
  };
  const handleDelete = async () => {
    if (isLoggedIn()) {
      setLocalGoodCount((prev) => prev - 1);
      if (user) {
        try {
          await unGoodMutation.mutateAsync({
            postId: post.postId,
            userId: user.userId,
          });
        } catch (error) {
          setLocalGoodCount((prev) => prev + 1);
        }
      }
    }
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

  const handleGetGooder = (selectedPostId) => {
    setSelectedPostId(selectedPostId);
    setOpenGooder(true);
  };

  const handleCloseGetGooder = () => {
    setOpenGooder(false);
  };

  return (
    <>
      {showLoginDialog && <LoginDialog />}
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
      <CustomDialog
        open={OpenGooder}
        title="Liked this post"
        onClose={handleCloseGetGooder}
        width="400px"
      >
        <GoodDetail postId={selectedPostId} />
      </CustomDialog>
      {post && post.user && (
        <List>
          <div key={post.postId} className="w-full mx-auto flex group ">
            <div className="flex">
              <div className="mr-1">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ filter: "brightness(0.9)" }}
                >
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
                </motion.div>
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
                        {judgePostLabel(t, post)}
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
                        mr: 1,
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
                          <ListItemIcon>
                            <EditIcon fontSize="small" />
                          </ListItemIcon>
                          <div className="font-soft">Edit</div>
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
                      <Review post={post} visible={fromDetail ? false : true} />
                      <div className="flex items-center mt-1 ">
                        <motion.div whileTap={{ scale: 0.9 }}>
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
                        </motion.div>
                        <div
                          className="text-xs font-soft hover:underline cursor-pointer"
                          onClick={() => handleGetGooder(post.postId)}
                        >
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
