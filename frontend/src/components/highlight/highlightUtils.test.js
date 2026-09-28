import { joinLines, filterHighlights, distinctLabels, distinctBooks, formatCitation } from "./highlightUtils";

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
      label: { labelId: 1, name: "work" },
      book: { bookId: 10, title: "吾輩は猫である", author: "夏目漱石" },
    },
    {
      memoId: 2,
      quote: "The only way out is through.",
      note: "自分への言い聞かせ",
      label: { labelId: 2, name: "life" },
      book: { bookId: 20, title: "Some Book", author: "Some Author" },
    },
    {
      memoId: 3,
      quote: "ラベルなしの一文",
      note: null,
      label: null,
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

  test("labelで絞り込める", () => {
    expect(filterHighlights(highlights, { label: "work" }).map((h) => h.memoId)).toEqual([1]);
  });

  test("bookIdで絞り込める", () => {
    expect(filterHighlights(highlights, { bookId: 10 }).map((h) => h.memoId)).toEqual([1, 3]);
  });

  test("複数条件はAND条件で絞り込む", () => {
    expect(filterHighlights(highlights, { bookId: 10, query: "ラベルなし" }).map((h) => h.memoId)).toEqual([3]);
  });
});

describe("distinctLabels / distinctBooks", () => {
  const highlights = [
    { label: { labelId: 1, name: "work" }, book: { bookId: 10, title: "A" } },
    { label: { labelId: 1, name: "work" }, book: { bookId: 10, title: "A" } },
    { label: null, book: { bookId: 20, title: "B" } },
  ];

  test("distinctLabelsは名前の重複を除いたラベルを返す", () => {
    expect(distinctLabels(highlights)).toEqual([{ labelId: 1, name: "work" }]);
  });

  test("distinctBooksはbookIdの重複を除いた本を返す", () => {
    expect(distinctBooks(highlights)).toEqual([
      { bookId: 10, title: "A" },
      { bookId: 20, title: "B" },
    ]);
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
