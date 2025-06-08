import { Box, Divider } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { CustomDialog } from "../../ui/CustomDialog";
import React from "react";
import { BookDetail } from "./BookDetail";
import { findReadingByUser } from "../../api/reading";
import { BookArray } from "./BookArray";

export const BookShelf = ({ account, onClick }) => {
  const [readings, setReadings] = useState([]);
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState();
  const [book, setBook] = useState();

  const toRead = readings.filter((r) => {
    return r.statusType === "NONE";
  });

  const readingNow = readings.filter((r) => {
    return r.statusType === "DOING";
  });

  const done = readings.filter((d) => {
    return d.statusType === "DONE";
  });
  const fiction = done.filter((b) => {
    return b.book.largeGenre === "FICTION";
  });
  const nonFiction = done.filter((b) => {
    return b.book.largeGenre === "NON_FICTION";
  });
  const tech = done.filter((b) => {
    return b.book.largeGenre === "PROFESSIONAL_TECHNICAL";
  });
  const art = done.filter((b) => {
    return b.book.largeGenre === "ARTS_CULTURE";
  });
  const study = done.filter((b) => {
    return b.book.largeGenre === "EDUCATION_STUDYAIDS";
  });
  const entertainment = done.filter((b) => {
    return b.book.largeGenre === "ENTERTAINMENT";
  });
  const academic = done.filter((b) => {
    return b.book.largeGenre === "ACADEMICS_RESEARCH";
  });
  const practical = done.filter((b) => {
    return b.book.largeGenre === "PRACTICAL_HOBBIES";
  });
  const other = done.filter((b) => {
    return b.book.largeGenre === "UNKNOWN" || b.book.largeGenre === "OTHER";
  });

  const handleSelect = (selectedReading) => {
    setReading(selectedReading);
    setBook(selectedReading.book);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const find = useCallback(async () => {
    const result = await findReadingByUser(account.userId && account.userId);
    setReadings(result.data);
  }, [account.userId]);
  useEffect(() => {
    find();
  }, [find]);
  return (
    <>
      {!onClick && (
        <CustomDialog open={open} title="Detail" onClose={handleClose}>
          <BookDetail
            book={book}
            reading={reading}
            updated={() => {
              find();
            }}
          />
        </CustomDialog>
      )}
      <div className="text-lg font-medium font-soft">Want To Read</div>
      <div className="w-[700px] overflow-x-auto px-2 py-2 ">
        {toRead.length !== 0 ? (
          <BookArray
            books={toRead}
            handleSelect={handleSelect}
            onClick={onClick}
            width={"80px"}
            height={"120px"}
          />
        ) : (
          <Box
            sx={{
              height: "120px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="font-soft text-zinc-500">No books.</div>
          </Box>
        )}
      </div>
      <Divider sx={{ height: "auto", m: 1 }} />
      <div className="text-lg  mt-2 font-medium font-soft py-1">
        Reading Now
      </div>
      <div className="w-[700px] overflow-x-auto px-2 py-2 ">
        {readingNow.length !== 0 ? (
          <BookArray
            books={readingNow}
            handleSelect={handleSelect}
            onClick={onClick}
            width={"80px"}
            height={"120px"}
          />
        ) : (
          <Box
            sx={{
              height: "120px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="font-soft text-zinc-500">No books.</div>
          </Box>
        )}
      </div>

      <Divider sx={{ height: "auto", m: 1 }} />
      {fiction.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1">
          <>
            <div className="text-lg  mt-2 mb-2 font-medium font-soft">
              Fiction
            </div>
            <BookArray
              books={fiction}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {nonFiction.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1 ">
          <>
            <div className="text-lg mb-2 font-soft"> Non Fiction</div>
            <BookArray
              books={nonFiction}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {tech.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1">
          <>
            <div className="text-lg mb-2 font-soft">
              Professional & Technical
            </div>
            <BookArray
              books={tech}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {art.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1 ">
          <>
            <div className="text-lg mb-2 font-soft"> Arts & Culture</div>
            <BookArray
              books={art}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {study.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1 ">
          <>
            <div className="text-lg mb-2 font-soft">Education & Study-aids</div>
            <BookArray
              books={study}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {entertainment.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1 ">
          <>
            <div className="text-lg mb-2 font-soft"> Entertainment</div>
            <BookArray
              books={entertainment}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {academic.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1">
          <>
            <div className="text-lg mb-2 font-soft"> Academics & Research</div>
            <BookArray
              books={academic}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      {practical.length !== 0 && (
        <div className="w-[700px] overflow-x-auto px-2 py-1">
          <>
            <div className="text-lg mb-2 font-soft"> Practical & Hobbies</div>
            <BookArray
              books={practical}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        </div>
      )}
      <div className="w-[700px] overflow-x-auto px-2 py-1 ">
        {other.length !== 0 && (
          <>
            <div className="text-lg mb-2 font-soft"> Other</div>
            <BookArray
              books={other}
              handleSelect={handleSelect}
              onClick={onClick}
              width={"80px"}
              height={"120px"}
            />
            <Divider sx={{ height: "auto", m: 1 }} />
          </>
        )}
      </div>
    </>
  );
};
