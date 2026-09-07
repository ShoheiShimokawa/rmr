import { formatDescription } from "./util";

describe("formatDescription", () => {
  test("空・未定義の場合はそのまま返す", () => {
    expect(formatDescription("")).toBe("");
    expect(formatDescription(undefined)).toBe(undefined);
    expect(formatDescription(null)).toBe(null);
  });

  test("文末記号を含まないテキストはそのまま返す", () => {
    const text = "no terminal punctuation here";
    expect(formatDescription(text)).toBe(text);
  });

  test("英語の文を2文ごとに段落分けする", () => {
    const text =
      "A special new edition in celebration of the anniversary. Harry Potter has never been the star of a Quidditch team. He knows no spells.";
    expect(formatDescription(text)).toBe(
      "A special new edition in celebration of the anniversary. Harry Potter has never been the star of a Quidditch team.\n\nHe knows no spells."
    );
  });

  test("日本語の文を2文ごとに段落分けし、文間に余計な空白を入れない", () => {
    const text =
      "青豆はそう決めた。Qはquestion markのQだ。疑問を背負ったもの。彼女は歩きながら一人で肯いた。";
    expect(formatDescription(text)).toBe(
      "青豆はそう決めた。Qはquestion markのQだ。\n\n疑問を背負ったもの。彼女は歩きながら一人で肯いた。"
    );
  });
});
