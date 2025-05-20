import { Box, Divider } from "@mui/material";
import { useState, useEffect } from "react";
import React from "react";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "../UserProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { statusTypeStr, judgeIcon } from "../../badge/index";
import { BookDetail } from "./BookDetail";
import { BookRegister } from "./BookRegister";
import { ReadingRegister } from "../ReadingRegister";
import { findReadingByUser } from "../../api/reading";
import { getReading } from "../../api/reading";
import { useMessage } from "../../ui/useMessage";
import Avatar from "@mui/material/Avatar";
import { BookArray } from "./BookArray";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Chip,
  Slide,
  Paper,
} from "@mui/material";

export const BookShelf = ({ account }) => {
  const [readings, setReadings] = useState([]);
  const [selectedBook, setSelectedBook] = useState();
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [showReadingRegister, setShoWReadingRegister] = useState(false);
  const [reading, setReading] = useState();
  const [book, setBook] = useState();
  const { showMessage, AlertComponent } = useMessage();

  const recent = readings.filter((r) => {
    return r.statusType === "NONE" || r.statusType === "DOING";
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
      <Dialog open={open}>
        <Slide in direction="left" appear={false}>
          <DialogTitle>
            {!showReadingRegister ? "Detail" : "Review"}
          </DialogTitle>
        </Slide>
        <Slide in direction="left" appear={false}>
          <DialogContent>
            <div>
              {!showReadingRegister ? (
                <BookDetail
                  reading={reading}
                  show={() => {
                    setShoWReadingRegister(true);
                  }}
                  updated={() => {
                    find();
                    setOpen(false);
                  }}
                  book={book}
                />
              ) : (
                <ReadingRegister
                  book={reading.book && reading.book}
                  reading={reading}
                  updated={() => setShoWReadingRegister(false)}
                />
              )}
            </div>
          </DialogContent>
        </Slide>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openRegister}>
        <DialogTitle>Register books!</DialogTitle>
        <DialogContent>
          <BookRegister
            updated={() => handleCloseRegister()}
            reload={() => find()}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseRegister();
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <div className="text-lgfont-medium">Recently</div>

      {recent.length !== 0 ? (
        <BookArray books={recent} handleSelect={handleSelect} />
      ) : (
        <Box sx={{ height: "155px", width: "100%" }} />
      )}

      <Divider sx={{ height: "auto", m: 1 }} />
      {AlertComponent}
      {/* <div className="text-xl font-sans"> Books in My Past</div> */}
      {fiction.length !== 0 && (
        <>
          <div className="text-lg  font-medium"> Fiction</div>
          <BookArray books={fiction} handleSelect={handleSelect} />
        </>
      )}
      {nonFiction.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Non Fiction</div>
          <BookArray books={nonFiction} handleSelect={handleSelect} />
        </>
      )}
      {tech.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Professional & Technical</div>
          <BookArray books={tech} handleSelect={handleSelect} />
        </>
      )}
      {art.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Arts & Culture</div>
          <BookArray books={art} handleSelect={handleSelect} />
        </>
      )}
      {study.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Education & Study-aids</div>
          <BookArray books={study} handleSelect={handleSelect} />
        </>
      )}
      {entertainment.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Entertainment</div>
          <BookArray books={entertainment} handleSelect={handleSelect} />
        </>
      )}
      {academic.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Academics & Research</div>
          <BookArray books={academic} handleSelect={handleSelect} />
        </>
      )}
      {practical.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Practical & Hobbies</div>
          <BookArray books={practical} handleSelect={handleSelect} />
        </>
      )}
      {other.length !== 0 && (
        <>
          <div className="text-lg font-sans"> Other</div>
          <BookArray books={other} handleSelect={handleSelect} />
        </>
      )}
    </>
  );
};
