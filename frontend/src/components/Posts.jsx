import { useContext, useEffect, useState, useCallback } from "react";
import { getPostAll } from "../api/post";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import UserContext from "./UserProvider";
import { registerReading } from "../api/reading";
import { HandleRegister } from "./HandleRegister";
import { good, deleteGood, getGooder, getGoodPostAll } from "../api/post";
import {
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Box,
  Divider,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";

export const Posts = ({}) => {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(UserContext);
  const [goodPosts, setGoodPosts] = useState({});
  const [selectedPost, setSelectedPost] = useState();
  const [kari, setKari] = useState(false);

  const find = async () => {
    const result = await getPostAll();
    setPosts(result.data);
    const initGood = {};
    const goodList = await getGoodPostAll(user && user.userId);
    var a = goodList && goodList.data.map((good) => good.post.postId);
    setGoodPosts(a);
  };
  const handleSelectUser = (user) => {};

  const handleKari = () => {
    setKari(true);
  };

  const handleCloseKari = () => {
    setKari(false);
  };

  const handleGood = useCallback(
    debounce(async (selectedPost) => {
      setGoodPosts([...goodPosts, selectedPost]);
      //   if (true) {
      //     const param = {
      //       postId: selectedPost.postId,
      //       userId: user && user.userId,
      //     };
      //     const result = await good(param);
      //   } else {
      //     await deleteGood();
      //   }
    }, 400), // 500ms の間に連打されても 1 回だけリクエスト
    []
  );

  const handleCancel = (selectedPost) => {
    setGoodPosts(goodPosts.filter((post) => post !== selectedPost));
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <div>
        <IconButton component={Link} to="/PostRegister">
          <PostAddRoundedIcon />
        </IconButton>
      </div>
      <Button
        size="small"
        variant="contained"
        onClick={() => {
          handleKari();
        }}
      >
        kari_registerHandle
      </Button>
      <Dialog onClose={handleCloseKari} open={kari}>
        <DialogTitle>create Account</DialogTitle>
        <DialogContent>
          <HandleRegister account={user} />
        </DialogContent>
      </Dialog>
      <div className="container mx-auto space-y-1">
        {posts.length !== 0 && (
          <>
            {posts.map((post) => (
              <Card key={post.postId} sx={{ maxWidth: 800 }}>
                <CardContent>
                  <div className="flex">
                    <Link
                      to={`/userPage/${post.user.handle}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Avatar
                        src={post.user.picture && post.user.picture}
                        className="mr-2"
                        onClick={() => handleSelectUser(post.user)}
                      />
                    </Link>
                    <div>
                      <div>{post.user.name}</div>
                      <div>{post.user.handle}</div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    {post.reading && (
                      <>
                        <div className="space-y-2">
                          <div className="mt-2 mb-4">
                            {post.reading.thoughts}
                          </div>
                          <div className="flex">
                            <Box
                              component="img"
                              sx={{ width: "20%", height: "auto" }}
                              src={post.reading.book.thumbnail}
                            />
                            <div className="ml-2">
                              <div>{post.reading.book.title}</div>
                              <div>{post.reading.book.author}</div>
                            </div>
                          </div>
                          {goodPosts.length > 0 &&
                          !goodPosts.includes(post.postId) ? (
                            <IconButton
                              onClick={() => {
                                handleGood(post.postId);
                              }}
                            >
                              <FavoriteBorderRoundedIcon color="error" />a
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => {
                                handleCancel(post.postId);
                              }}
                            >
                              <FavoriteRoundedIcon color="error" />
                            </IconButton>
                          )}{" "}
                          <div>いいね数をここに表示{}</div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
