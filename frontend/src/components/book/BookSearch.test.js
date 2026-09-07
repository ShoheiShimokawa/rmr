import { sortByLanguagePreference } from "./BookSearch";

const book = (id, language) => ({ id, volumeInfo: { language } });

describe("sortByLanguagePreference", () => {
  test("優先言語の本を先頭に、それ以外は元の順序を保ったまま並べる", () => {
    const items = [
      book("en-1", "en"),
      book("ja-1", "ja"),
      book("en-2", "en"),
      book("ja-2", "ja"),
    ];

    const sorted = sortByLanguagePreference(items, "ja");

    expect(sorted.map((b) => b.id)).toEqual([
      "ja-1",
      "ja-2",
      "en-1",
      "en-2",
    ]);
  });

  test("優先言語の本が無ければ元の順序のまま返す", () => {
    const items = [book("en-1", "en"), book("fr-1", "fr")];

    const sorted = sortByLanguagePreference(items, "ja");

    expect(sorted.map((b) => b.id)).toEqual(["en-1", "fr-1"]);
  });

  test("元の配列を破壊しない", () => {
    const items = [book("en-1", "en"), book("ja-1", "ja")];

    sortByLanguagePreference(items, "ja");

    expect(items.map((b) => b.id)).toEqual(["en-1", "ja-1"]);
  });

  test("空配列を渡してもエラーにならない", () => {
    expect(sortByLanguagePreference([], "ja")).toEqual([]);
  });
});
