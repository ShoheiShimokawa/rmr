import { CustomDialog } from "../ui/CustomDialog";
import { BookShelf } from "./book/BookShelf";
import { BookSearch } from "./book/BookSearch";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect, useMemo } from "react";
import { useContext } from "react";
import { registerBook } from "../api/book";
import { GiBookshelf } from "react-icons/gi";
import { BookInfo } from "../components/book/BookInfo";
import UserContext from "./UserProvider";
import { IconButton } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerReading } from "../api/reading";
import {
  Card,
  CardContent,
  //   Typography,
  Grid,
  Chip,
  //   Box,
  Button,
  Slide,
} from "@mui/material";
import { getByUserIdAndBookId } from "../api/reading";
import { RadioGroup, Radio, Typography, Sheet, Box } from "@mui/joy";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { genreToEnum } from "../util";

export const SelectBook = ({ onClick, onNext }) => {
  const [openBookShelf, setOpenBookShelf] = useState(false);
  const [selectedBook, setSelectedBook] = useState();
  const [selectedReading, setSelectedReading] = useState(null);
  const { user } = useContext(UserContext);
  const [openBookSearch, setOpenBookSearch] = useState(false);

  const schema = z.object({
    status: z.string().min(1, { message: "Please select a reading status." }),
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "",
    },
  });
  useEffect(() => {
    if (selectedReading?.statusType) {
      setValue("status", selectedReading.statusType);
    }
  }, [selectedReading, setValue]);

  const readingStates = [
    {
      value: "NONE",
      label: "Want to Read",
      icon: <BookmarkBorderIcon />,
    },
    { value: "DOING", label: "Reading", icon: <MenuBookIcon /> },
    { value: "DONE", label: "Read", icon: <CheckCircleIcon /> },
  ];

  const handleNext = async (data) => {
    if (!selectedBook || !user) return;

    try {
      const result = await registerBook(selectedBook);
      if (selectedReading) {
        onNext && onNext(selectedReading);
      } else {
        const param = {
          bookId: result.data.bookId,
          userId: user.userId,
          statusType: data.status,
          rate: 0,
          thoughts: "",
        };
        const response = await registerReading(param);
        const reading = response.data;
        onNext && onNext(reading);
      }

      onClick && onClick();
    } catch (error) {
      console.error("Reading registration failed", error);
    } finally {
      //   setLoading(false);
    }
  };

  const handleOpenBookShelf = () => {
    setOpenBookShelf(true);
  };

  const handleCloseBookShelf = () => {
    setOpenBookShelf(false);
  };

  const handleOpenBookSearch = () => {
    setOpenBookSearch(true);
  };

  const handleCloseBookSearch = () => {
    setOpenBookSearch(false);
  };

  const fromPost = (selectedBook) => {
    const isbn = selectedBook.volumeInfo.industryIdentifiers
      ? selectedBook.volumeInfo.industryIdentifiers.filter(
          (id) => id.type === "ISBN_13"
        )
      : "";
    const author = selectedBook.volumeInfo.authors
      ? selectedBook.volumeInfo.authors[0]
      : "";
    const genre = selectedBook.volumeInfo?.categories
      ? selectedBook.volumeInfo.categories[0]
      : "";
    const book = {
      isbn: isbn.identifier ? isbn.identifier : "",
      id: selectedBook.id,
      title: selectedBook.volumeInfo.title && selectedBook.volumeInfo.title,
      author: author,
      genre: genreToEnum(genre),
      description:
        selectedBook.volumeInfo.description &&
        selectedBook.volumeInfo.description,
      thumbnail:
        selectedBook.volumeInfo.imageLinks.thumbnail &&
        selectedBook.volumeInfo.imageLinks.thumbnail,
      publishedDate:
        selectedBook.volumeInfo.publishedDate &&
        selectedBook.volumeInfo.publishedDate,
    };
    setSelectedReading(null);
    setValue("status", "");
    setSelectedBook(book);
    setOpenBookSearch(false);
  };

  const find = async () => {
    const result = await getByUserIdAndBookId(
      user.userId,
      selectedBook && selectedBook.bookId
    );
    setSelectedReading(result.data);
  };
  return (
    <div>
      <CustomDialog
        open={openBookShelf}
        title="My Bookshelf"
        onClose={handleCloseBookShelf}
      >
        <BookShelf
          account={user}
          onClick={(selectedBook) => {
            setSelectedBook(selectedBook);
            setOpenBookShelf(false);
            getByUserIdAndBookId(user.userId, selectedBook.bookId)
              .then((res) => {
                setSelectedReading(res.data);
              })
              .catch((err) => {
                setSelectedReading(null);
              });
          }}
        />
      </CustomDialog>
      <CustomDialog
        open={openBookSearch}
        title="Search"
        onClose={handleCloseBookSearch}
      >
        <BookSearch fromPost={fromPost} />
      </CustomDialog>
      <div className="font-bold mb-2 font-soft">Select a Book 📖</div>
      <div className="flex">
        <Button
          variant="contained"
          endIcon={<GiBookshelf />}
          onClick={handleOpenBookShelf}
          sx={{
            textTransform: "none",
            backgroundColor: "#000",
            color: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
        >
          from my bookshelf
        </Button>
        <IconButton>
          <SearchIcon onClick={handleOpenBookSearch} />
        </IconButton>
      </div>
      <div className="mt-4">
        {selectedBook ? (
          <BookInfo book={selectedBook} />
        ) : (
          <Box sx={{ height: "135px", width: "100%" }} />
        )}
      </div>
      {selectedBook && (
        <form onSubmit={handleSubmit(handleNext)}>
          <div className="mt-3 mb-2 text-lg font-soft">
            What's your reading status for this book?
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <RadioGroup
                {...field}
                sx={{ display: "flex", gap: 2, flexDirection: "row" }}
              >
                {readingStates.map((state) => (
                  <Sheet
                    key={state.value}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      alignItems: "center",
                      boxShadow: "sm",
                      borderRadius: "md",
                      opacity: selectedReading ? 0.5 : 1,
                    }}
                  >
                    <Radio
                      overlay
                      value={state.value}
                      checked={field.value === state.value}
                      disabled={Boolean(selectedReading)}
                    />
                    <Box sx={{ mt: 1 }}>{state.icon}</Box>
                    <Typography level="body-sm">{state.label}</Typography>
                  </Sheet>
                ))}
              </RadioGroup>
            )}
          />

          {errors.status && (
            <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>
              {errors.status.message}
            </Typography>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              variant="contained"
              endIcon={<NavigateNextIcon />}
              sx={{
                textTransform: "none",
                backgroundColor: "#000",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              Next
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
