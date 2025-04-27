import { getPostAllByUser } from "../api/post";
import { useContext, useState, useEffect } from "react";
import UserContext from "./UserProvider";
import {
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Box,
  Divider,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

export const MyPosts = ({ account }) => {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const find = async () => {
    const userId =
      account.userId === user.userId ? user.userId : account.userId;
    const result = await getPostAllByUser(userId);
    setPosts(result.data);
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <div>
      <div className="container mx-auto space-y-3">
        {posts && (
          <>
            {posts.map((post) => (
              <Card key={post.postId} sx={{ maxWidth: 800 }}>
                <CardContent>
                  <div className="flex">
                    <Avatar src={user && user.picture} className="mr-2" />
                    <div>
                      <div>{post.name}</div>
                      <div>{post.handle}</div>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    {post.reading && (
                      <>
                        <div className="space-y-2">
                          <div className="mt-2">{post.reading.thoughts}</div>
                          {/* <div>{judgeRead(book)}</div> */}
                          <div className="flex">
                            <Box
                              component="img"
                              src={post.reading.book.thumbnail}
                              sx={{ width: "20%", height: "auto" }}
                            />
                            <div className="ml-2">
                              <div>{post.reading.book.title}</div>
                              <div>{post.reading.book.author}</div>
                            </div>
                          </div>
                          <FavoriteBorderRoundedIcon />{" "}
                          <div>いいね数をここに表示</div>
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
