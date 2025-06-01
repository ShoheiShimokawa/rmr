import { Box } from "@mui/material";
import { Book } from "./Book";
import { Button, Chip, Slide, Paper, Rating } from "@mui/material";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { useContext, useEffect, useState } from "react";

export const BookArray = ({ books, handleSelect, onClick }) => {
  return (
    <div>
      {books.length !== 0 && (
        <>
          <div className="ml-2">
            <div
              className="flex overflow-x-auto gap-3"
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
                    />
                    {reading.statusType === "DONE" && (
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
