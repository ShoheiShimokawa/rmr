import { useState } from "react";
import { Rating } from "@mui/material";
import { CollapsibleText } from "./CollapsibleText";
import { BookDetail } from "./book/BookDetail";
import { BookInfo } from "../components/book/BookInfo";
import { CustomDialog } from "../ui/CustomDialog";

export const Review = ({ visible = false, post, forNotification = false }) => {
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
      <CustomDialog
        open={showBookDetail}
        title="Detail"
        onClose={handleCloseBookDetail}
      >
        <BookDetail book={selectedBook} />
      </CustomDialog>
      <div>
        {post.reading.rate !== 0 && (
          <Rating
            className="mt-1"
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
        <div
          className={`text-sm mt-1 font-soft ${
            forNotification ? "text-zinc-500" : ""
          }`}
        >
          <CollapsibleText text={post.reading.thoughts} maxLength={250} />
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
      </div>
    </>
  );
};
