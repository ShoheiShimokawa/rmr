import { registerReading, updateReading } from "../api/reading";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import CircularProgress from "@mui/material/CircularProgress";
import { useContext, useState } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotify } from "../hooks/NotifyProvider";
import { TextField, Button, Rating, FormControlLabel } from "@mui/material";
import { IOSSwitch } from "../ui/IOSSwitch";
import { motion } from "framer-motion";

export const ReadingRegister = ({ book, reading, updated, isRecommended }) => {
  const { user } = useContext(UserContext);
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = book || reading ? false : true;

  const formSchema = z
    .object({
      rate: z.number().optional(),
      thoughts: z
        .string()
        .max(600, "Your thoughts must be under 600 characters."),
      recommended: z.boolean(),
    })
    .refine(
      (data) => {
        return (
          !data.recommended || (data.thoughts && data.thoughts.trim() !== "")
        );
      },
      {
        path: ["thoughts"],
        message: "Thought is required if you recommend this book.",
      }
    );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rate: reading ? reading.rate : 0,
      thoughts: reading ? reading.thoughts : "",
      recommended: isRecommended ? true : false,
    },
  });
  const watchedRate = useWatch({ control, name: "rate" });
  const watchedThoughts = useWatch({ control, name: "thoughts" });
  const watchedRecommended = useWatch({ control, name: "recommended" });

  const isSkipped =
    !watchedRate && (!watchedThoughts || watchedThoughts.trim() === "");

  const isReviewed =
    watchedRate && (!watchedThoughts || watchedThoughts.trim() === "");

  const isSubmitDisabled =
    isDisabled ||
    (watchedRecommended && (!watchedThoughts || watchedThoughts.trim() === ""));

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const trimmedThoughts = values.thoughts.trim().replace(/\n/g, "");
      values.thoughts = trimmedThoughts.length === 0 ? "" : values.thoughts;
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
        reset({
          rate: 0,
          thoughts: "",
          recommended: false,
        });
        notify("Congrats!", "success");
      } else {
        const param = {
          ...values,
          bookId: book ? book.bookId : reading.book.bookId,
          userId: user.userId,
          statusType: "DONE",
        };
        await registerReading(param);
        updated && updated();
        reset({
          rate: 0,
          thoughts: "",
          recommended: false,
        });
        notify("Congrats!", "success");
      }
    } catch (error) {
      notify("Something went wrong.", "error");
    } finally {
      setIsSubmitting(false);
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
        <div className="font-soft mt-1 mb-2 font-bold">
          Recommend this book to others?
        </div>
        <div className="ml-3">
          <Controller
            name="recommended"
            control={control}
            disabled={isDisabled}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <IOSSwitch
                    {...field}
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
              />
            )}
          />
        </div>
        <TextField
          {...register("thoughts")}
          placeholder={
            watchedRecommended
              ? "Tell us why you'd recommend this book!"
              : "Share your thoughts or feelings."
          }
          variant="outlined"
          multiline
          fullWidth
          rows={8}
          margin="normal"
          error={!!errors.thoughts}
          helperText={errors.thoughts?.message}
          disabled={isDisabled}
        />
        <div className="text-xs text-right mt-1 font-soft">
          <span
            className={
              watchedThoughts.length > 600
                ? "text-red-500 font-bold"
                : "text-zinc-500"
            }
          >
            {watchedThoughts.length}/600
          </span>
        </div>

        <div className="flex justify-end mt-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitDisabled}
              sx={{
                textTransform: "none",
                backgroundColor: "#000",
                color: "#fff",
                width: "150px",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#333",
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : isSkipped ? (
                "Skip Review"
              ) : isReviewed ? (
                "Submit"
              ) : (
                "Post"
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
};
