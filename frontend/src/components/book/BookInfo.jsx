import { Book } from "./Book";

export const BookInfo = ({ book, onClick }) => {
  return (
    <>
      {book && (
        <div className="flex">
          <div className="flex-shrink-0">
            <Book book={book} onClick={onClick} />
          </div>
          <div className="ml-2 mt-2 text-xs text-zinc-800 font-soft">
            <div className="font-soft">{book.title}</div>
            <div className="text-zinc-500 mt-2 text-xs font-soft">
              {book.author}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
