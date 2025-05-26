import { useState, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AutoComplete } from "../ui/AutoComplete";
import { useNotify } from "../hooks/NotifyProvider";
import { getLabels } from "../api/label";
import { BookInfo } from "../components/book/BookInfo";
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

export const MemoRegister = ({ updated, book }) => {
  const [openBookShelf, setOpenBookShelf] = useState(false);
  const { user } = useContext(UserContext);
  const [labels, setLabels] = useState([]);
  const { notify } = useNotify();

  const formSchema = z.object({
    memo: z.string().min(1, "highlight is required."),
    page: z.number().max(5).optional(),
    label: z.enum(),
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
    try {
      const param = {
        ...values,
        // readingId: selectedReading.readingId,
        userId: user.userId,
        // labelId:
      };
      await registerMemo(param);
      notify("success create a highlight!", "success");
      updated && updated();
    } catch (error) {
      notify("Failed to create highlight.", "error");
    }
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
      {book && <BookInfo book={book} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="font-bold">*Highlight Impression Words 📝</div>
        <TextField
          {...register("memo")}
          placeholder="memo impression words."
          variant="outlined"
          multiline
          fullWidth
          rows={4}
          margin="normal"
          error={!!errors.memo}
          helperText={errors.memo?.message}
          //   disabled={!selectedBook}
        />

        <div className="mt-3 mb-2 font-bold">Note the page number 🔖</div>
        <div className="">
          <TextField
            // label="page:"
            type="number"
            size="small"
            variant="standard"
            // disabled={!selectedBook}
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

        <div className="mt-5 mb-1 font-bold">Label 🏷️</div>
        <AutoComplete
          options={optionsLabel && optionsLabel}
          //   disabled={!selectedBook}
        />
        <div className="text-sm mb-4 ml-1 italic text-zinc-500">
          E.g. For work, Investment tips, Inspiring quotes
        </div>
        <div className="">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            // disabled={!selectedBook}
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
