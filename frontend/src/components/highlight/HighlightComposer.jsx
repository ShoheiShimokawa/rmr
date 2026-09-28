import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Collapse, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import { BookInfo } from "../book/BookInfo";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { useNotify } from "../../hooks/NotifyProvider";
import { useHighlightMutations, useMyHighlights } from "../../hooks/useHighlight";
import { track, EVENTS } from "../../tracking";
import { LabelChipPicker } from "./LabelChipPicker";
import { QUOTE_MAX, NOTE_MAX, LABEL_MAX, PAGE_MAX, joinLines, distinctLabels, isIOS } from "./highlightUtils";

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
  label: z.string().max(LABEL_MAX, `Must be ${LABEL_MAX} characters or fewer.`).optional(),
});

const emptyValuesFrom = (highlight) => ({
  quote: highlight?.quote || "",
  note: highlight?.note || "",
  page: highlight?.page ?? undefined,
  label: highlight?.label?.name || "",
});

/**
 * ハイライトの新規作成・編集フォーム。Record画面や本の詳細、
 * ハイライト一覧の編集ダイアログなど、複数の場所から再利用される。
 * highlightを渡すと編集モードになる。
 */
export const HighlightComposer = ({ book, reading, highlight, entryPoint, autoFocus = true, onSaved, onCancel }) => {
  const { notify } = useNotify();
  const { createHighlight, updateHighlight } = useHighlightMutations();
  const { data: myHighlights = [] } = useMyHighlights();
  const [showDetails, setShowDetails] = useState(!!(highlight?.page || highlight?.note || highlight?.label));
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
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
    setShowDetails(!!(highlight?.page || highlight?.note || highlight?.label));
  }, [highlight, reset]);

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
            label: values.label || null,
            spoiler: highlight.spoiler,
          },
          { ownerId: reading?.user?.userId }
        );
        track(EVENTS.HIGHLIGHT_UPDATE);
        notify("Highlight updated.", "success");
      } else {
        await createHighlight(
          {
            readingId: reading.readingId,
            quote: values.quote,
            note: values.note || null,
            page: values.page ?? null,
            label: values.label || null,
          },
          { ownerId: reading.user?.userId }
        );
        track(EVENTS.HIGHLIGHT_CREATE, {
          entry_point: entryPoint,
          has_note: !!values.note,
          has_page: values.page != null,
          has_label: !!values.label,
        });
        notify("Saved to your highlights.", "success");
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
      {book && <BookInfo book={book} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("quote")}
          placeholder="Type or paste the line that stayed with you…"
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

        <Button
          size="small"
          onClick={() => setShowDetails((v) => !v)}
          endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ textTransform: "none", pl: 0 }}
        >
          More details
        </Button>
        <Collapse in={showDetails}>
          <Box sx={{ mt: 1 }}>
            <TextField
              {...register("page", { valueAsNumber: true })}
              type="number"
              size="small"
              variant="standard"
              label="Page"
              slotProps={{ htmlInput: { min: 1, max: PAGE_MAX } }}
              sx={{ width: "110px" }}
              error={!!errors.page}
              helperText={errors.page?.message}
            />
            <TextField
              {...register("note")}
              placeholder="Why did it stay with you? (optional)"
              variant="outlined"
              multiline
              fullWidth
              rows={2}
              margin="normal"
              error={!!errors.note}
              helperText={errors.note?.message}
            />
            <Controller
              name="label"
              control={control}
              render={({ field }) => (
                <LabelChipPicker
                  labels={distinctLabels(myHighlights)}
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
          </Box>
        </Collapse>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          {onCancel && (
            <Button onClick={onCancel} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
          )}
          <PrimaryButton type="submit" disabled={submitting}>
            {highlight ? "Save" : "Save highlight"}
          </PrimaryButton>
        </Box>
      </form>
    </Box>
  );
};
