import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import { BookInfo } from "../book/BookInfo";
import { PrimaryButton } from "../../ui/PrimaryButton";
import UserContext from "../UserProvider";
import { useNotify } from "../../hooks/NotifyProvider";
import { useReading } from "../../hooks/useReading";
import { useHighlightMutations } from "../../hooks/useHighlight";
import { track, EVENTS } from "../../tracking";
import { QUOTE_MAX, NOTE_MAX, PAGE_MAX, joinLines, isIOS } from "./highlightUtils";

const schema = z.object({
  quote: z
    .string()
    .min(1, "A line is required.")
    .max(QUOTE_MAX, `Must be ${QUOTE_MAX} characters or fewer.`),
  note: z.string().max(NOTE_MAX, `Must be ${NOTE_MAX} characters or fewer.`).optional(),
  page: z.preprocess(
    (value) => (value === "" || value === null || Number.isNaN(value) ? undefined : value),
    z.number().int().min(1).max(PAGE_MAX).optional()
  ),
});

const emptyValuesFrom = (highlight) => ({
  quote: highlight?.quote || "",
  note: highlight?.note || "",
  page: highlight?.page ?? undefined,
});

/**
 * 本の一節(Quote)の新規作成・編集フォーム。Record画面のQuotesタブや本の詳細、
 * Quotes一覧の編集ダイアログなど、複数の場所から再利用される。
 * highlightを渡すと編集モードになる。readingは省略可能で、新規作成時に
 * まだ本棚に無い本であれば、保存のタイミングで読書中として自動登録する。
 */
export const HighlightComposer = ({
  book,
  reading,
  highlight,
  entryPoint,
  autoFocus = true,
  showBookInfo = true,
  onSaved,
  onCancel,
}) => {
  const { user } = useContext(UserContext);
  const { notify } = useNotify();
  const { getByUserIdAndBookId, registerReading } = useReading();
  const { createHighlight, updateHighlight } = useHighlightMutations();
  const [showNote, setShowNote] = useState(!!highlight?.note);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValuesFrom(highlight),
  });

  const quoteValue = watch("quote") || "";

  useEffect(() => {
    reset(emptyValuesFrom(highlight));
    setShowNote(!!highlight?.note);
  }, [highlight, reset]);

  // まだ本棚に無い本に一節を保存する場合、読書中として先に登録する。
  // キャッシュが古いと読了済みの本を読書中へ巻き戻しかねないため、最新状態を確認してから登録する。
  const ensureReading = async () => {
    if (reading) return reading;
    const latest = await getByUserIdAndBookId(user.userId, book.bookId);
    if (latest.data) return latest.data;
    const created = await registerReading(
      { bookId: book.bookId, userId: user.userId, statusType: "DOING", rate: 0, thoughts: "" },
      { sourceId: book.id }
    );
    return created.data;
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (highlight) {
        await updateHighlight(
          {
            memoId: highlight.memoId,
            quote: values.quote,
            note: values.note || null,
            page: values.page ?? null,
            label: null,
            spoiler: highlight.spoiler,
          },
          { ownerId: user.userId }
        );
        track(EVENTS.HIGHLIGHT_UPDATE);
        notify("Quote updated.", "success");
      } else {
        const targetReading = await ensureReading();
        await createHighlight(
          {
            readingId: targetReading.readingId,
            quote: values.quote,
            note: values.note || null,
            page: values.page ?? null,
            label: null,
          },
          { ownerId: user.userId }
        );
        track(EVENTS.HIGHLIGHT_CREATE, {
          entry_point: entryPoint,
          has_note: !!values.note,
          has_page: values.page != null,
        });
        notify("Quote saved.", "success");
        reset(emptyValuesFrom(null));
      }
      onSaved && onSaved();
    } catch (error) {
      notify(error.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinLines = () => {
    setValue("quote", joinLines(quoteValue), { shouldValidate: true, shouldDirty: true });
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <Box onKeyDown={handleKeyDown}>
      {book && showBookInfo && <BookInfo book={book} />}
      {!highlight && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1, mb: 0.5 }}>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-soft">A line from this book</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-soft flex items-center gap-0.5">
            <LockOutlinedIcon sx={{ fontSize: 12 }} />
            Only you
          </span>
        </Box>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("quote")}
          placeholder="Type or paste a line from the book"
          variant="outlined"
          multiline
          fullWidth
          rows={4}
          margin="normal"
          autoFocus={autoFocus}
          error={!!errors.quote}
          helperText={errors.quote?.message}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mt: -1, mb: 1 }}>
          <Box>
            {quoteValue.includes("\n") && (
              <Button size="small" startIcon={<FormatAlignLeftIcon fontSize="small" />} onClick={handleJoinLines}>
                Join lines
              </Button>
            )}
            {isIOS() && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 font-soft mt-1">
                Tip: long-press the box, then tap "Scan Text" to type with your camera.
              </div>
            )}
          </Box>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-soft whitespace-nowrap">
            {quoteValue.length}/{QUOTE_MAX}
          </div>
        </Box>

        <TextField
          {...register("page", { valueAsNumber: true })}
          type="number"
          size="small"
          variant="standard"
          label="Page"
          slotProps={{ htmlInput: { min: 1, max: PAGE_MAX } }}
          sx={{ width: "110px", mb: 1 }}
          error={!!errors.page}
          helperText={errors.page?.message}
        />

        {!showNote && (
          <Button
            size="small"
            startIcon={<AddIcon fontSize="small" />}
            onClick={() => setShowNote(true)}
            sx={{ textTransform: "none", pl: 0, display: "block" }}
          >
            Why it stayed with you
          </Button>
        )}
        {showNote && (
          <TextField
            {...register("note")}
            placeholder="Why did this line stay with you?"
            variant="outlined"
            multiline
            fullWidth
            rows={2}
            margin="normal"
            error={!!errors.note}
            helperText={errors.note?.message}
          />
        )}

        {!highlight && !reading && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-soft mt-2">
            Saving also adds this book to your shelf as Reading Now.
          </div>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          {onCancel && (
            <Button onClick={onCancel} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
          )}
          <PrimaryButton type="submit" disabled={submitting}>
            {highlight ? "Save" : "Save quote"}
          </PrimaryButton>
        </Box>
      </form>
    </Box>
  );
};
