import {
  joinLines,
  filterHighlights,
  distinctBooks,
  groupHighlightsByBook,
  formatCitation,
  formatQuote,
  appendQuote,
  hasSeenQuotesIntro,
  markQuotesIntroSeen,
  isJapaneseLocale,
} from "./highlightUtils";

describe("joinLines", () => {
  test("日本語の改行は空白を入れずに連結する", () => {
    expect(joinLines("吾輩は\n猫である。")).toBe("吾輩は猫である。");
  });

  test("英語の改行は半角スペースを入れて連結する", () => {
    expect(joinLines("It was the best of times,\nit was the worst of times.")).toBe(
      "It was the best of times, it was the worst of times."
    );
  });

  test("行末がハイフンの場合はハイフンを除いて直接連結する", () => {
    expect(joinLines("This is a beauti-\nful morning.")).toBe("This is a beautiful morning.");
  });

  test("日本語と英語が混在する行は接する側の文字種で連結方法を決める", () => {
    expect(joinLines("これはiPhone\nで撮った写真です。")).toBe("これはiPhoneで撮った写真です。");
  });

  test("空行(段落区切り)は残したまま連結する", () => {
    expect(joinLines("第一段落の一行目\n第一段落の二行目\n\n第二段落")).toBe(
      "第一段落の一行目第一段落の二行目\n\n第二段落"
    );
  });

  test("CRLF(\\r\\n)の改行もLFと同様に扱う", () => {
    expect(joinLines("first line\r\nsecond line\r\n\r\nthird paragraph")).toBe(
      "first line second line\n\nthird paragraph"
    );
  });

  test("空文字・未指定はそのまま返す", () => {
    expect(joinLines("")).toBe("");
    expect(joinLines(undefined)).toBeUndefined();
    expect(joinLines(null)).toBeNull();
  });
});

describe("filterHighlights", () => {
  const highlights = [
    {
      memoId: 1,
      quote: "人生は短い",
      note: null,
      book: { bookId: 10, title: "吾輩は猫である", author: "夏目漱石" },
    },
    {
      memoId: 2,
      quote: "The only way out is through.",
      note: "自分への言い聞かせ",
      book: { bookId: 20, title: "Some Book", author: "Some Author" },
    },
    {
      memoId: 3,
      quote: "別の一文",
      note: null,
      book: { bookId: 10, title: "吾輩は猫である", author: "夏目漱石" },
    },
  ];

  test("条件を渡さない場合は全件を返す", () => {
    expect(filterHighlights(highlights)).toHaveLength(3);
  });

  test("検索語はquote/note/book.title/book.authorのいずれかに一致すれば通す", () => {
    expect(filterHighlights(highlights, { query: "言い聞かせ" }).map((h) => h.memoId)).toEqual([2]);
    expect(filterHighlights(highlights, { query: "夏目漱石" }).map((h) => h.memoId)).toEqual([1, 3]);
  });

  test("検索語は全角/半角・大文字/小文字の違いを無視する(NFKC+小文字化)", () => {
    expect(filterHighlights(highlights, { query: "ＴＨＲＯＵＧＨ" }).map((h) => h.memoId)).toEqual([2]);
  });

  test("bookIdで絞り込める", () => {
    expect(filterHighlights(highlights, { bookId: 10 }).map((h) => h.memoId)).toEqual([1, 3]);
  });

  test("複数条件はAND条件で絞り込む", () => {
    expect(filterHighlights(highlights, { bookId: 10, query: "別の" }).map((h) => h.memoId)).toEqual([3]);
  });
});

describe("distinctBooks", () => {
  const highlights = [
    { book: { bookId: 10, title: "A" } },
    { book: { bookId: 10, title: "A" } },
    { book: { bookId: 20, title: "B" } },
  ];

  test("distinctBooksはbookIdの重複を除いた本を返す", () => {
    expect(distinctBooks(highlights)).toEqual([
      { bookId: 10, title: "A" },
      { bookId: 20, title: "B" },
    ]);
  });
});

describe("groupHighlightsByBook", () => {
  const highlights = [
    { memoId: 1, book: { bookId: 10, title: "A" } },
    { memoId: 2, book: { bookId: 20, title: "B" } },
    { memoId: 3, book: { bookId: 10, title: "A" } },
  ];

  test("bookIdごとにグルーピングし、各グループのhighlightsは元の順序を保つ", () => {
    expect(groupHighlightsByBook(highlights)).toEqual([
      { book: { bookId: 10, title: "A" }, highlights: [highlights[0], highlights[2]] },
      { book: { bookId: 20, title: "B" }, highlights: [highlights[1]] },
    ]);
  });

  test("グループの順序は一覧内でその本が最初に現れた位置を保つ", () => {
    const reordered = [highlights[1], highlights[0], highlights[2]];
    expect(groupHighlightsByBook(reordered).map((g) => g.book.bookId)).toEqual([20, 10]);
  });

  test("空・未指定の場合は空配列を返す", () => {
    expect(groupHighlightsByBook([])).toEqual([]);
    expect(groupHighlightsByBook(undefined)).toEqual([]);
  });
});

describe("formatCitation", () => {
  test("書名・著者・ページをまとめて返す", () => {
    expect(formatCitation({ book: { title: "こころ", author: "夏目漱石" }, page: 42 })).toBe(
      "こころ / 夏目漱石 p.42"
    );
  });

  test("ページが無い場合は書名・著者のみ返す", () => {
    expect(formatCitation({ book: { title: "こころ", author: "夏目漱石" } })).toBe("こころ / 夏目漱石");
  });

  test("本情報が無い場合は空文字を返す", () => {
    expect(formatCitation({})).toBe("");
  });
});

describe("formatQuote", () => {
  test("日本語を含む引用は「」で囲む", () => {
    expect(formatQuote({ quote: "吾輩は猫である。" })).toBe("「吾輩は猫である。」");
  });

  test("日本語を含まない引用は\"\"で囲む", () => {
    expect(formatQuote({ quote: "To be or not to be." })).toBe('"To be or not to be."');
  });

  test("引用が無い場合は空文字を返す", () => {
    expect(formatQuote({})).toBe("");
    expect(formatQuote(null)).toBe("");
  });
});

describe("appendQuote", () => {
  test("既存の感想の末尾に空行区切りで引用を追記する", () => {
    expect(appendQuote("great book", { quote: "a line" }, 600)).toBe(
      'great book\n\n"a line"'
    );
  });

  test("感想が空の場合は引用のみを返す", () => {
    expect(appendQuote("", { quote: "a line" }, 600)).toBe('"a line"');
    expect(appendQuote("   ", { quote: "a line" }, 600)).toBe('"a line"');
  });

  test("上限文字数に収まらない場合はnullを返す", () => {
    const longThoughts = "a".repeat(590);
    expect(appendQuote(longThoughts, { quote: "a line that is long" }, 600)).toBeNull();
  });

  test("引用が無い場合は感想をそのまま返す", () => {
    expect(appendQuote("great book", {}, 600)).toBe("great book");
  });
});

describe("isJapaneseLocale", () => {
  test("言語設定がjaで始まる場合はtrueを返す", () => {
    expect(isJapaneseLocale({ language: "ja-JP" })).toBe(true);
    expect(isJapaneseLocale({ language: "ja" })).toBe(true);
  });

  test("日本語以外の場合はfalseを返す", () => {
    expect(isJapaneseLocale({ language: "en-US" })).toBe(false);
  });

  test("languageが無い場合はlanguagesの先頭を見る", () => {
    expect(isJapaneseLocale({ language: "", languages: ["ja-JP", "en-US"] })).toBe(true);
  });

  test("navが無い場合はfalseを返す", () => {
    expect(isJapaneseLocale(undefined)).toBe(false);
  });
});

describe("hasSeenQuotesIntro / markQuotesIntroSeen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("未確認の状態ではfalseを返す", () => {
    expect(hasSeenQuotesIntro()).toBe(false);
  });

  test("markQuotesIntroSeenを呼ぶと以後hasSeenQuotesIntroはtrueを返す", () => {
    markQuotesIntroSeen();
    expect(hasSeenQuotesIntro()).toBe(true);
  });
});
