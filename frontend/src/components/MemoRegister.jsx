import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AutoComplete } from "../ui/AutoComplete";
import { useNotify } from "../hooks/NotifyProvider";
import { getLabels } from "../api/label";
import { BookInfo } from "../components/book/BookInfo";
import { registerMemo } from "../api/memo";
import { Button, Box, TextField, InputAdornment } from "@mui/material";
import { useContext } from "react";
import UserContext from "./UserProvider";

export const MemoRegister = ({ updated, book, reading }) => {
  const { user } = useContext(UserContext);
  const [labels, setLabels] = useState([]);
  const { notify } = useNotify();

  const formSchema = z.object({
    memo: z.string().min(1, "highlight is required."),
    page: z.preprocess(
      (val) =>
        val === "" || val === null || Number.isNaN(val) ? undefined : val,
      z.number().max(99999).optional()
    ),
    label: z.string().optional(),
  });

  const {
    control,
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = async (values) => {
    try {
      const param = {
        ...values,
        readingId: reading && reading.readingId,
        userId: user.userId,
      };
      await registerMemo(param);
      notify("success create a highlight!", "success");
      updated && updated();
      reset();
    } catch (error) {
      notify("Failed to create highlight.", "error");
    }
  };

  const find = async () => {
    const result = await getLabels(user && user.userId);
    setLabels(result.data);
  };

  const optionsLabel = labels
    .filter((label) => label.label)
    .map((label) => label.label);

  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      {reading && <BookInfo book={reading.book} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="font-bold mt-2">*Highlight Impression Words 📝</div>
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
            {...register("page", { valueAsNumber: true })}
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
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <AutoComplete
              options={optionsLabel}
              value={field.value || ""}
              onChange={field.onChange}
            />
          )}
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
