import { Box } from "@mui/material";
import { Button, Chip, Slide, Paper, Rating } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useContext, useEffect, useState } from "react";

export const BookArray = ({ books, handleSelect }) => {
  const [selectedBook, setSelectedBook] = useState(null);
  return (
    <div>
      {
        books.length !== 0 && (
          <>
            <div className="ml-2">
              <div className="flex overflow-x-auto gap-3">
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
                      <Box
                        component="img"
                        src={reading.book.thumbnail}
                        sx={{
                          transform:
                            selectedBook === reading.book
                              ? "scale(1.1)"
                              : "scale(1)",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                        key={reading.readingId}
                        onClick={() => {
                          handleSelect && handleSelect(reading);
                          setSelectedBook(reading.book);
                        }}
                      />
                      {reading.statusType !== "DONE" ? (
                        <Chip
                          icon={judgeIcon(reading.statusType)}
                          label={statusTypeStr(reading.statusType)}
                          size="small"
                          sx={{ marginTop: 1 }}
                        />
                      ) : (
                        <Rating
                          name="read-only"
                          value={reading.rate}
                          readOnly
                          size="small"
                        />
                      )}
                    </div>
                  </>
                ))}
              </div>
            </div>
          </>
        )

        // <Box sx={{ height: "140px", width: "100%" }} />
      }
    </div>
  );
};
