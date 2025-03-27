import { Divider } from "@mui/material";
import { Box } from "@mui/material";
export const BookDetail = ({ book }) => {
  return (
    <div className="flex">
      <div>
        {book && (
          <>
            <div className="flex">
              <Box
                component="img"
                src={book.thumbnail}
                sx={{ width: "100", height: "100" }}
              />
              <div>
                <div className="text-xl"> {book.title}</div>
                <div>authored by {book.author}</div>
                <div>{book.genre}</div>
                <div>
                  published Date :{" "}
                  {book.publishedDate ? book.publishedDate : "unknown"}
                </div>
              </div>
            </div>

            <div className="text-base font-sans">{book.description}</div>
          </>
        )}
      </div>
    </div>
  );
};
