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
} from "@mui/material";
import { Book } from "./book/Book";
import { Link } from "react-router-dom";
import { BookDetail } from "./book/BookDetail";

export const Post = ({ post, visible }) => {
  const [selectedPost, setSelectedPost] = useState();
  const [selectedBook, setSelectedBook] = useState();
  const [showBookDetail, setShowBookDetail] = useState(false);

  const handleShowBookDetail = (selectedBook) => {
    setSelectedBook(selectedBook);
    setShowBookDetail(true);
  };

  const handleCloseBookDetail = () => {
    setShowBookDetail(false);
  };

  return (
    <>
      <Dialog onClose={handleCloseBookDetail} open={showBookDetail}>
        <DialogTitle>Detail</DialogTitle>
        <DialogContent>
          <BookDetail book={selectedBook} />
        </DialogContent>
      </Dialog>
      {post && (
        <Card key={post.postId} sx={{ maxWidth: 600 }} elevation={0}>
          <CardContent>
            <div className="flex">
              <Link
                to={`/userPage/${post.user.handle}`}
                style={{ textDecoration: "none" }}
              >
                <Avatar
                  src={post.user.picture && post.user.picture}
                  className="mr-2"
                />
              </Link>
              <div>
                <div>{post.user.name}</div>
                <div className="text-sm text-zinc-500">{post.user.handle}</div>
              </div>
            </div>
            <div className="flex gap-6">
              {post.reading && (
                <>
                  <div>
                    <Rating
                      className="mt-1"
                      name="read-only"
                      value={post.reading.rate}
                      size="small"
                      readOnly
                    />
                    <div className="text-sm">{post.reading.thoughts}</div>
                    {visible && (
                      <div className="flex mt-2">
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
                          )}{" "} */}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
