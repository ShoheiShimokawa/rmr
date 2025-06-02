import { Book } from "./Book";
import PersonIcon from "@mui/icons-material/Person";

export const BookInfo = ({ book, onClick }) => {
  return (
    <>
      {book && (
        <div className="flex">
          <Book book={book} onClick={onClick} />
          <div className="ml-2 text-sm text-zinc-800 font-soft">
            <div className="font-soft">{book.title}</div>
            <div className="text-zinc-500 mt-2 text-sm font-soft">
              {book.author}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
