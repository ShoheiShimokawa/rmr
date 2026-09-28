import { useMemo, useState } from "react";
import { Box, TextField } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/Public";
import { CustomDialog } from "../../ui/CustomDialog";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { RecordModeToggle } from "./RecordModeToggle";
import { HighlightCard } from "./HighlightCard";
import { appendQuote, isJapaneseLocale } from "./highlightUtils";

// ReadingRegisterの感想欄と同じ上限。デモ用にここでも揃えておく。
const REVIEW_MAX = 600;

const EXAMPLES = {
  ja: {
    book: { title: "草枕", author: "夏目漱石" },
    quotes: [
      {
        quote: "智に働けば角が立つ。情に棹させば流される。意地を通せば窮屈だ。とかくに人の世は住みにくい。",
        note: "今の職場の板挟みそのもの",
        page: 5,
      },
      {
        quote: "どこへ越しても住みにくいと悟った時、詩が生れて、画が出来る。",
        note: null,
        page: 5,
      },
    ],
    review: "前半は筋を追うというより、ものの見方そのものを読まされている感じがする。",
  },
  en: {
    book: { title: "A Tale of Two Cities", author: "Charles Dickens" },
    quotes: [
      {
        quote: "It was the best of times, it was the worst of times.",
        note: "How I'd sum up this year so far.",
        page: 1,
      },
      {
        quote: "It is a far, far better thing that I do, than I have ever done before.",
        note: null,
        page: 360,
      },
    ],
    review: "The opening line does more work than I expected — it sets up the whole book's tension.",
  },
};

const seedQuotes = (example) =>
  example.quotes.map((q, index) => ({
    memoId: `demo-${index}`,
    quote: q.quote,
    note: q.note,
    page: q.page,
    registerDate: new Date().toISOString(),
    book: example.book,
  }));

/**
 * Record画面でQuotesタブを初めて開いたときなどに表示する、Quotes(本の言葉・非公開)と
 * Review(自分の言葉・投稿すると公開)の使い分けを、実際に触れるミニデモで説明するヒント。
 * 表示する本・引用はブラウザの言語設定で切り替える(日本語ならja、それ以外はenの例)。
 * デモの状態は閉じるたびに初期値へ戻す(次に開いたときも同じ説明から始められるように)。
 */
export const QuotesIntroDialog = ({ open, onClose }) => {
  const example = useMemo(() => (isJapaneseLocale() ? EXAMPLES.ja : EXAMPLES.en), []);
  const [tab, setTab] = useState("highlight");
  const [quotes, setQuotes] = useState(() => seedQuotes(example));
  const [review, setReview] = useState(example.review);
  const [draftQuote, setDraftQuote] = useState("");
  const [draftPage, setDraftPage] = useState("");

  const handleSaveDemoQuote = () => {
    const trimmed = draftQuote.trim();
    if (!trimmed) return;
    setQuotes((prev) => [
      {
        memoId: `demo-${Date.now()}`,
        quote: trimmed,
        note: null,
        page: draftPage ? Number(draftPage) : null,
        registerDate: new Date().toISOString(),
        book: example.book,
      },
      ...prev,
    ]);
    setDraftQuote("");
    setDraftPage("");
  };

  const handleUseInReview = (highlight) => {
    const next = appendQuote(review, highlight, REVIEW_MAX);
    if (next !== null) {
      setReview(next);
    }
    setTab("review");
  };

  const handleClose = () => {
    setTab("highlight");
    setQuotes(seedQuotes(example));
    setReview(example.review);
    setDraftQuote("");
    setDraftPage("");
    onClose();
  };

  return (
    <CustomDialog open={open} title="How Quotes work" onClose={handleClose} width="480px">
      <div className="font-soft text-sm font-bold">{example.book.title}</div>
      <div className="font-soft text-xs text-zinc-500 dark:text-zinc-400 mb-1">{example.book.author}</div>
      <RecordModeToggle value={tab} onChange={setTab} quoteCount={quotes.length} />

      <div style={{ display: tab === "highlight" ? "block" : "none" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1.5, mb: 0.5 }}>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-soft">A line from this book</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-soft flex items-center gap-0.5">
            <LockOutlinedIcon sx={{ fontSize: 12 }} />
            Only you
          </span>
        </Box>
        <TextField
          value={draftQuote}
          onChange={(event) => setDraftQuote(event.target.value)}
          placeholder="Type or paste a line from the book"
          variant="outlined"
          multiline
          fullWidth
          rows={2}
          size="small"
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, mb: 1.5 }}>
          <TextField
            value={draftPage}
            onChange={(event) => setDraftPage(event.target.value.replace(/\D/g, ""))}
            type="number"
            size="small"
            variant="standard"
            label="Page"
            sx={{ width: "90px" }}
          />
          <Box sx={{ flex: 1 }} />
          <PrimaryButton size="small" onClick={handleSaveDemoQuote}>
            Save quote
          </PrimaryButton>
        </Box>
        {quotes.map((quote) => (
          <HighlightCard
            key={quote.memoId}
            highlight={quote}
            isOwner={false}
            showBook={false}
            onUseInReview={handleUseInReview}
          />
        ))}
      </div>

      <div style={{ display: tab === "review" ? "block" : "none" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5, mt: 1.5, mb: 0.5 }}>
          <PublicIcon sx={{ fontSize: 12, color: "text.secondary" }} />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-soft">Public when posted</span>
        </Box>
        <TextField
          value={review}
          onChange={(event) => setReview(event.target.value)}
          placeholder="Your own thoughts on this book"
          variant="outlined"
          multiline
          fullWidth
          rows={5}
          size="small"
        />
      </div>

      <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5, mt: 2 }}>
        <ul className="font-soft text-sm text-zinc-600 dark:text-zinc-300 m-0 pl-4 list-disc space-y-1">
          <li>Save as many quotes as you like, with the page number — only you see them.</li>
          <li>"Use in review" pulls one into your Review, ready to write around.</li>
          <li>Review is your own take, and goes public on your profile once you post it.</li>
        </ul>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <PrimaryButton size="small" onClick={handleClose}>
          Got it
        </PrimaryButton>
      </Box>
    </CustomDialog>
  );
};
