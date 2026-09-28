export const QUOTE_MAX = 500;
export const NOTE_MAX = 1000;
export const PAGE_MAX = 99999;

const CJK_REGEX = /[぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/;

const isCjk = (char) => !!char && CJK_REGEX.test(char);

/**
 * 改行区切りのテキストを1つの文章に詰める。空行(段落区切り)は残す。
 * 行末がハイフンの場合は取り除いて直接連結し(英単語の折り返し対策)、
 * それ以外はCJK文字が接する箇所を空白なし、そうでなければ半角スペースで連結する。
 */
export const joinLines = (text) => {
  if (!text) return text;
  const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const joinedParagraphs = paragraphs
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .reduce((acc, line) => {
          if (!acc) return line;
          if (acc.endsWith("-")) {
            return acc.slice(0, -1) + line;
          }
          const separator = isCjk(acc.slice(-1)) || isCjk(line.slice(0, 1)) ? "" : " ";
          return acc + separator + line;
        }, "")
    )
    .filter((paragraph) => paragraph.length > 0);
  return joinedParagraphs.join("\n\n");
};

/** 検索用にNFKC正規化+小文字化する。全角/半角や大文字/小文字の違いを吸収する。 */
export const normalizeForSearch = (text) => (text || "").normalize("NFKC").toLowerCase();

/** ハイライト一覧を、検索語・本の2条件で絞り込む(すべて省略可、AND条件)。 */
export const filterHighlights = (list, { query, bookId } = {}) => {
  const normalizedQuery = query ? normalizeForSearch(query) : "";
  return (list || []).filter((highlight) => {
    if (bookId && highlight.book?.bookId !== bookId) return false;
    if (normalizedQuery) {
      const haystack = normalizeForSearch(
        [highlight.quote, highlight.note, highlight.book?.title, highlight.book?.author]
          .filter(Boolean)
          .join(" ")
      );
      if (!haystack.includes(normalizedQuery)) return false;
    }
    return true;
  });
};

/** ハイライト一覧から、本(bookId)が重複しない一覧を返す。 */
export const distinctBooks = (list) => {
  const byId = new Map();
  (list || []).forEach((highlight) => {
    if (highlight.book?.bookId != null) {
      byId.set(highlight.book.bookId, highlight.book);
    }
  });
  return [...byId.values()];
};

/**
 * ハイライト一覧を本(book.bookId)ごとにグルーピングする。
 * グループの順序は一覧内でその本が最初に現れた位置を保つ(呼び出し側の並び順をそのまま踏襲する)。
 */
export const groupHighlightsByBook = (list) => {
  const groups = new Map();
  (list || []).forEach((highlight) => {
    const bookId = highlight.book?.bookId;
    if (!groups.has(bookId)) {
      groups.set(bookId, { book: highlight.book, highlights: [] });
    }
    groups.get(bookId).highlights.push(highlight);
  });
  return [...groups.values()];
};

/** コピー・引用表示用に「書名 / 著者 p.N」の形式にまとめる。 */
export const formatCitation = (highlight) => {
  if (!highlight?.book) return "";
  const parts = [highlight.book.title, highlight.book.author].filter(Boolean).join(" / ");
  return highlight.page ? `${parts} p.${highlight.page}` : parts;
};

/** iOS(iPhone/iPad、およびiPadOSのMacIntel偽装)かどうかを判定する。 */
export const isIOS = (nav = typeof navigator !== "undefined" ? navigator : undefined) => {
  if (!nav) return false;
  return (
    /iP(hone|ad|od)/.test(nav.userAgent || "") ||
    (nav.platform === "MacIntel" && nav.maxTouchPoints > 1)
  );
};

/** ブラウザ(システム)の言語設定が日本語かどうかを判定する。 */
export const isJapaneseLocale = (nav = typeof navigator !== "undefined" ? navigator : undefined) => {
  if (!nav) return false;
  const lang = nav.language || (nav.languages && nav.languages[0]) || "";
  return lang.toLowerCase().startsWith("ja");
};

/** 日本語などCJK文字を含む引用は「」、それ以外は""で囲んで返す。 */
export const formatQuote = (highlight) => {
  if (!highlight?.quote) return "";
  return CJK_REGEX.test(highlight.quote) ? `「${highlight.quote}」` : `"${highlight.quote}"`;
};

/**
 * thoughtsの末尾に引用を空行区切りで追記して返す。maxLengthに収まらない場合はnullを返す。
 */
export const appendQuote = (thoughts, highlight, maxLength) => {
  const quote = formatQuote(highlight);
  if (!quote) return thoughts;
  const trimmed = (thoughts || "").trim();
  const next = trimmed ? `${trimmed}\n\n${quote}` : quote;
  return next.length > maxLength ? null : next;
};

const QUOTES_INTRO_SEEN_KEY = "rmr_quotes_intro_seen";

/** Quotesタブの使い方ヒントを既に見たかどうかを返す(ブラウザ単位、localStorage)。 */
export const hasSeenQuotesIntro = () => {
  try {
    return localStorage.getItem(QUOTES_INTRO_SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

/** Quotesタブの使い方ヒントを見た状態として記録する。 */
export const markQuotesIntroSeen = () => {
  try {
    localStorage.setItem(QUOTES_INTRO_SEEN_KEY, "1");
  } catch {
    // localStorageが使えない環境では何もしない
  }
};
