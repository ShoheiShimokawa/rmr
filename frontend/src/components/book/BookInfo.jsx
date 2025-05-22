import { Book } from "./Book";

export const BookInfo = ({ book, onClick }) => {
  return (
    <>
      {book && (
        <div className="flex">
          <Book book={book} onClick={onClick} />
          <div className="ml-2 text-sm text-zinc-800">
            <div>{book.title}</div>
            <div className="text-zinc-500 mt-2 text-sm">{book.author}</div>
          </div>
        </div>
      )}
    </>
  );
};
