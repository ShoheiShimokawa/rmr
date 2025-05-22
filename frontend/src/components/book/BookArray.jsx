import { Box } from "@mui/material";
import { Book } from "./Book";
import { Button, Chip, Slide, Paper, Rating } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useContext, useEffect, useState } from "react";

export const BookArray = ({ books, handleSelect }) => {
  return (
    <div>
      {books.length !== 0 && (
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
                    <Book
                      book={reading.book}
                      onClick={() => {
                        handleSelect && handleSelect(reading);
                      }}
                      key={reading.readingId}
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
                        value={reading.rate && reading.rate}
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
      )}
    </div>
  );
};
