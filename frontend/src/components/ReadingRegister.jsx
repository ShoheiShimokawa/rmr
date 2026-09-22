import { useReading } from "../hooks/useReading";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import CircularProgress from "@mui/material/CircularProgress";
import { useContext, useEffect, useRef, useState } from "react";
import UserContext from "./UserProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNotify } from "../hooks/NotifyProvider";
import { TextField, Rating, FormControlLabel } from "@mui/material";
import { IOSSwitch } from "../ui/IOSSwitch";
import { PrimaryButton } from "../ui/PrimaryButton";
import { motion } from "framer-motion";

export const ReadingRegister = ({
  book,
  reading,
  updated,
  isRecommended,
  sourceId,
  initialValues,
  onDraftChange,
}) => {
  const { user } = useContext(UserContext);
  const { registerReading, updateReading } = useReading();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = book || reading ? false : true;
  // 未指定ならbookプロパティのIDにフォールバックする。
  const resolvedSourceId = sourceId ?? book?.id;

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
    // 下書き(initialValues)があれば既存の読書内容より優先して復元する
    defaultValues: initialValues
      ? {
          rate: initialValues.rate ?? 0,
          thoughts: initialValues.thoughts ?? "",
          recommended: !!initialValues.recommended,
        }
      : {
          rate: reading ? reading.rate : 0,
          thoughts: reading ? reading.thoughts : "",
          recommended: isRecommended ? true : false,
        },
  });
  const watchedRate = useWatch({ control, name: "rate" });
  const watchedThoughts = useWatch({ control, name: "thoughts" });
  const watchedRecommended = useWatch({ control, name: "recommended" });

  // 入力が前回通知した内容から変わったときだけ呼び出し元へ通知する(下書き保存用)。
  // 初期値の描画時とコールバックの差し替えでは通知しない。
  const onDraftChangeRef = useRef(onDraftChange);
  const lastNotifiedRef = useRef(null);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);
  useEffect(() => {
    const values = {
      rate: watchedRate || 0,
      thoughts: watchedThoughts ?? "",
      recommended: !!watchedRecommended,
    };
    const last = lastNotifiedRef.current;
    lastNotifiedRef.current = values;
    if (
      last === null ||
      (last.rate === values.rate &&
        last.thoughts === values.thoughts &&
        last.recommended === values.recommended)
    ) {
      return;
    }
    onDraftChangeRef.current && onDraftChangeRef.current(values);
  }, [watchedRate, watchedThoughts, watchedRecommended]);

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
        await updateReading(updateParam, { sourceId: resolvedSourceId });
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
        await registerReading(param, { sourceId: resolvedSourceId });
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
                : "text-zinc-500 dark:text-zinc-400"
            }
          >
            {watchedThoughts.length}/600
          </span>
        </div>

        <div className="flex justify-end mt-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <PrimaryButton
              type="submit"
              disabled={isSubmitDisabled}
              sx={{ width: "150px" }}
            >
              {isSubmitting ? (
                <CircularProgress size={20} sx={{ color: "background.default" }} />
              ) : isSkipped ? (
                "Skip Review"
              ) : isReviewed ? (
                "Submit"
              ) : (
                "Post"
              )}
            </PrimaryButton>
          </motion.div>
        </div>
      </form>
    </div>
  );
};
