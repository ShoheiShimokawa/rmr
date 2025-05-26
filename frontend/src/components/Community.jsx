import { useContext, useEffect, useState, useCallback } from "react";
import { getPostAll } from "../api/post";
import { Post } from "./Post";
import { debounce } from "lodash";
import { useNotify } from "../hooks/NotifyProvider";

import { Link } from "react-router-dom";
import UserContext from "./UserProvider";
import { registerReading } from "../api/reading";
import { HandleRegister } from "./HandleRegister";
import { good, deleteGood, getGooder, getGoodPostAll } from "../api/post";
import {
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PostAddRoundedIcon from "@mui/icons-material/PostAddRounded";

export const Community = ({}) => {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(UserContext);
  const [goodPosts, setGoodPosts] = useState({});
  const [selectedPost, setSelectedPost] = useState();
  const [showBookDetail, setShowBookDetail] = useState(false);
  const [selectedBook, setSelectedBook] = useState();
  const { notify } = useNotify();
  const find = async () => {
    const result = await getPostAll();
    setPosts(result.data);
    const initGood = {};
    const goodList = await getGoodPostAll(user && user.userId);
    var a = goodList && goodList.data.map((good) => good.post.postId);
    setGoodPosts(a);
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
  const handleShowBookDetail = (selectedBook) => {
    setSelectedBook(selectedBook);
    setShowBookDetail(true);
  };
  const handleCloseBookDetail = () => {
    setShowBookDetail(false);
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <div className="container space-y-1 w-xl">
        {posts.length !== 0 && (
          <>
            {posts.map((post) => (
              <>
                <Post post={post} visible={true} />
                <Divider />
              </>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
