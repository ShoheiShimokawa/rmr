import { Book } from "./Book";
import { CollapsibleText } from "../CollapsibleText";

export const BookWithDesc = ({ book, width, height, maxLength }) => {
  return (
    <>
      {book && (
        <div>
          <div className="flex">
            <div className="flex-shrink-0">
              <Book
                book={book}
                width={width ? width : "90px"}
                height={height ? height : "130px"}
              />
            </div>
            <div className="ml-3 text-zinc-800 font-bold font-soft">
              <div>{book.title}</div>
              <div className="text-zinc-500 mt-2 text-sm font-soft">
                {book.author}
              </div>
            </div>
          </div>
          <div className="text-xs  mt-5 ml-1 font-soft">
            <CollapsibleText
              text={book.description}
              maxLength={maxLength ? maxLength : 70}
            />
          </div>
        </div>
      )}
    </>
  );
};
