import { useState, useEffect, useMemo } from "react";
import { GiBookshelf } from "react-icons/gi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AutoComplete } from "../ui/AutoComplete";

import { getLabels } from "../api/label";

import { registerMemo } from "../api/memo";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  TextField,
  Autocomplete,
  InputAdornment,
} from "@mui/material";

import { BookShelf } from "./book/BookShelf";
import { Book } from "./book/Book";
import { useContext } from "react";
import UserContext from "./UserProvider";

export const MemoRegister = (updated) => {
  const [openBookShelf, setOpenBookShelf] = useState(false);
  const { user } = useContext(UserContext);
  const [labels, setLabels] = useState([]);

  const [selectedBook, setSelectedBook] = useState();

  const formSchema = z.object({
    memo: z.string().min(1, "highlight is required."),
    page: z.number().max(5).optional(),
    // label: z.enum(),
  });

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = async (values) => {
    const param = {
      ...values,
      //   readingId: selectedReading.readingId,
      userId: user.userId,
      // labelId:
    };
    await registerMemo(param);
    console.log("success register highlight.");
    updated && updated();
  };

  const handleOpenBookShelf = () => {
    setOpenBookShelf(true);
  };

  const handleCloseBookShelf = () => {
    setOpenBookShelf(false);
  };

  const find = async () => {
    const result = await getLabels(user && user.userId);
    setLabels(result.data);
  };

  const optionsLabel = labels
    .filter((label) => label.name)
    .map((label) => label.name);

  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <Dialog
        open={openBookShelf}
        sx={{
          "& .MuiDialog-paper": {
            width: "600px",
          },
        }}
      >
        <DialogTitle>My Bookshelf</DialogTitle>
        <DialogContent>
          <BookShelf account={user} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookShelf}>Cancel</Button>
        </DialogActions>
      </Dialog>
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
        see my bookshelf
      </Button>
      {/* <Book book={selectedReading.book} /> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-5">Highlight Impression Words 📝</div>
        <TextField
          {...register("memo")}
          placeholder="memo impression words."
          variant="outlined"
          multiline
          fullWidth
          rows={6}
          margin="normal"
          error={!!errors.memo}
          helperText={errors.memo?.message}
          //   disabled={!selectedReading}
        />

        <div className="mt-3">Note the page number 🔖</div>
        <div className="">
          <TextField
            // label="page:"
            type="number"
            size="small"
            variant="standard"
            slotProps={{
              inputProps: {
                min: 1,
                max: 9999,
              },
            }}
            sx={{ width: "110px", ml: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <div className="text-xs">page:</div>
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="mt-4 mb-2">Label 🏷️</div>
        <AutoComplete options={optionsLabel && optionsLabel} />
        <div className="text-sm mb-3 ml-1 italic text-zinc-500">
          E.g. For work, Investment tips, Inspiring quotes
        </div>
        <div className="mt-1">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            //   disabled={!selectedReading}
            sx={{ textTransform: "none" }}
            // endIcon={<SendIcon />}
          >
            create!
          </Button>
        </div>
      </form>
    </div>
  );
};
