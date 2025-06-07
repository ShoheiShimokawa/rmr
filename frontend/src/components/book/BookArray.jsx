import { Book } from "./Book";

export const BookArray = ({ books, handleSelect, onClick, width, height }) => {
  return (
    <div>
      {books.length !== 0 && (
        <>
          <div className="ml-2">
            <div
              className="flex overflow-x-auto gap-4"
              style={{ minWidth: "max-content" }}
            >
              {books.map((reading) => (
                <>
                  <div
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
                      key={reading.readingId}
                      width={width && width}
                      height={height && height}
                    />
                    {/* {reading.statusType === "DONE" && reading.rate !== 0 && (
                      <div className="mt-1">
                        <Rating
                          name="read-only"
                          value={reading.rate && reading.rate}
                          readOnly
                          size="small"
                          sx={{
                            "& .MuiRating-icon": {
                              fontSize: "15px",
                            },
                          }}
                        />
                      </div>
                    )} */}
                  </div>
                </>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
