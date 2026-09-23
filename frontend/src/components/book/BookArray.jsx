import { Book } from "./Book";

export const BookArray = ({
  books,
  handleSelect,
  onClick,
  width,
  height,
  draftBookIds,
}) => {
  return (
    <div>
      {books.length !== 0 && (
        <div className="ml-2">
          <div
            className="flex overflow-x-auto gap-4 pt-2 pr-2"
            style={{ minWidth: "max-content" }}
          >
            {books.map((reading) => (
              <div
                key={reading.readingId}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Book
                  book={reading.book}
                  onClick={() => {
                    handleSelect && handleSelect(reading);
                    onClick && onClick(reading.book);
                  }}
                  width={width && width}
                  height={height && height}
                  hasDraft={draftBookIds && draftBookIds.has(reading.book.bookId)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
