export const QUOTE_MAX = 500;
export const NOTE_MAX = 1000;
export const LABEL_MAX = 30;
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

/** ハイライト一覧を、検索語・ラベル・本の3条件で絞り込む(すべて省略可、AND条件)。 */
export const filterHighlights = (list, { query, label, bookId } = {}) => {
  const normalizedQuery = query ? normalizeForSearch(query) : "";
  return (list || []).filter((highlight) => {
    if (bookId && highlight.book?.bookId !== bookId) return false;
    if (label && highlight.label?.name !== label) return false;
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

/** ハイライト一覧から、名前が重複しないラベルの一覧を返す。 */
export const distinctLabels = (list) => {
  const byName = new Map();
  (list || []).forEach((highlight) => {
    if (highlight.label?.name) {
      byName.set(highlight.label.name, highlight.label);
    }
  });
  return [...byName.values()];
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
