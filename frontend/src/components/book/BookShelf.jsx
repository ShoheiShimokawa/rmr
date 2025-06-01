import { Box, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import { CustomDialog } from "../../ui/CustomDialog";
import React from "react";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { BookDetail } from "./BookDetail";
import { findReadingByUser } from "../../api/reading";
import { useMessage } from "../../ui/useMessage";
import { BookArray } from "./BookArray";

export const BookShelf = ({ account, onClick }) => {
  const [readings, setReadings] = useState([]);
  const [selectedBook, setSelectedBook] = useState();
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [showReadingRegister, setShoWReadingRegister] = useState(false);
  const [reading, setReading] = useState();
  const [book, setBook] = useState();
  const { showMessage, AlertComponent } = useMessage();

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
    setShoWReadingRegister(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  const handleRegister = () => {
    setOpenRegister(true);
  };

  const find = async () => {
    const result = await findReadingByUser(account.userId && account.userId);
    setReadings(result.data);
  };
  useEffect(() => {
    find();
  }, []);
  return (
    <>
      {!onClick && (
        <CustomDialog open={open} title="Detail" onClose={handleClose}>
          <BookDetail book={book} reading={reading} />
        </CustomDialog>
      )}
      <div className="text-lg font-medium">Want To Read</div>
      <div className="w-[640px] overflow-x-auto px-2 py-2 ">
        {toRead.length !== 0 ? (
          <BookArray
            books={toRead}
            handleSelect={handleSelect}
            onClick={onClick}
          />
        ) : (
          <Box sx={{ height: "155px", width: "100%" }} />
        )}
      </div>
      <Divider sx={{ height: "auto", m: 1 }} />
      <div className="text-lg font-medium mt-2">Reading Now</div>
      <div className="w-[700px] overflow-x-auto px-2 py-2 ">
        {readingNow.length !== 0 ? (
          <BookArray
            books={readingNow}
            handleSelect={handleSelect}
            onClick={onClick}
          />
        ) : (
          <Box sx={{ height: "155px", width: "100%" }} />
        )}
      </div>

      <Divider sx={{ height: "auto", m: 1 }} />
      <div className="w-[700px] overflow-x-auto px-2  ">
        {fiction.length !== 0 && (
          <>
            <div className="text-lg  font-medium"> Fiction</div>
            <BookArray
              books={fiction}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>

      <div className="w-[700px] overflow-x-auto px-2  ">
        {nonFiction.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Non Fiction</div>
            <BookArray
              books={nonFiction}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>

      <div className="w-[700px] overflow-x-auto px-2 ">
        {tech.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Professional & Technical</div>
            <BookArray
              books={tech}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2  ">
        {art.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Arts & Culture</div>
            <BookArray
              books={art}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2 ">
        {study.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Education & Study-aids</div>
            <BookArray
              books={study}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2  ">
        {entertainment.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Entertainment</div>
            <BookArray
              books={entertainment}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2  ">
        {academic.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Academics & Research</div>
            <BookArray
              books={academic}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2">
        {practical.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Practical & Hobbies</div>
            <BookArray
              books={practical}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
      <div className="w-[700px] overflow-x-auto px-2 ">
        {other.length !== 0 && (
          <>
            <div className="text-lg font-sans"> Other</div>
            <BookArray
              books={other}
              handleSelect={handleSelect}
              onClick={onClick}
            />
          </>
        )}
      </div>
    </>
  );
};
