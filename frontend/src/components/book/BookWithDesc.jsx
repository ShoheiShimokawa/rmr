import { Book } from "./Book";
import { CollapsibleText } from "../CollapsibleText";

export const BookWithDesc = ({ book }) => {
  return (
    <>
      {book && (
        <div>
          <div className="flex">
            <Book book={book} width={"90px"} height={"130px"} />
            <div className="ml-2 text-lg text-zinc-800 font-bold font-soft">
              <div>{book.title}</div>
              <div className="text-zinc-500 mt-2 text-sm font-soft">
                {book.author}
              </div>
            </div>
          </div>
          <div className="text-xs  mt-5 ml-1 font-soft">
            <CollapsibleText text={book.description} maxLength={70} />
          </div>
        </div>
      )}
    </>
  );
};
