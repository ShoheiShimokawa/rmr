import { registerReading, updateReading } from "../api/reading";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotify } from "../hooks/NotifyProvider";
import { TextField, Button, Rating } from "@mui/material";

export const ReadingRegister = ({ book, reading, updated }) => {
  const { user } = useContext(UserContext);
  const { notify } = useNotify();
  const isDisabled = book || reading ? false : true;

  const formSchema = z.object({
    rate: z.number().optional(),
    thoughts: z.string().max(500),
  });

  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rate: reading ? reading.rate : null,
      thoughts: reading ? reading.thoughts : "",
    },
  });
  const watchedRate = useWatch({ control, name: "rate" });
  const watchedThoughts = useWatch({ control, name: "thoughts" });

  const isSkipped =
    !watchedRate && (!watchedThoughts || watchedThoughts.trim() === "");
  const onSubmit = async (values) => {
    try {
      if (reading) {
        const updateParam = {
          ...values,
          bookId: reading.book.bookId,
          userId: user.userId,
          statusType: "DONE",
          readingId: reading.readingId,
        };
        await updateReading(updateParam);
        updated && updated();
        notify("Congrats!", "success");
      } else {
        const param = {
          ...values,
          bookId: book ? book.bookId : reading.book.bookId,
          userId: user.userId,
          statusType: "DONE",
        };
        const result = await registerReading(param);
        updated && updated();
        notify("Congrats!", "success");
      }
    } catch (error) {
      notify("Something went wrong.", "error");
    } finally {
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Controller
            name="rate"
            control={control}
            render={({ field }) => (
              <Rating
                {...field}
                value={field.value || 0}
                disabled={isDisabled}
                onChange={(event, newValue) => field.onChange(newValue || 0)}
              />
            )}
          />
          {errors.rate && (
            <p style={{ color: "red", marginLeft: "8px" }}>
              {errors.rate.message}
            </p>
          )}
        </div>
        <TextField
          {...register("thoughts")}
          placeholder="share your thoughts or feelings."
          variant="outlined"
          multiline
          fullWidth
          rows={6}
          margin="normal"
          error={!!errors.thoughts}
          helperText={errors.thoughts?.message}
          disabled={isDisabled}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isDisabled}
          sx={{ textTransform: "none" }}
        >
          {isSkipped ? "Skip Review" : "Post"}
        </Button>
      </form>
    </div>
  );
};
