import {
  draftStatusLabel,
  hasDraftContent,
  isSameDraftContent,
} from "./useReadingDraft";

describe("hasDraftContent", () => {
  test("評価・感想・推薦のいずれも無ければ下書きにしない", () => {
    expect(hasDraftContent({ rate: 0, thoughts: "", recommended: false })).toBe(false);
    expect(hasDraftContent({})).toBe(false);
  });

  test("空白や改行だけの感想は空とみなす", () => {
    expect(hasDraftContent({ rate: 0, thoughts: "  \n\t ", recommended: false })).toBe(false);
  });

  test("感想があれば下書きにする", () => {
    expect(hasDraftContent({ rate: 0, thoughts: "面白かった", recommended: false })).toBe(true);
  });

  test("評価だけでも下書きにする", () => {
    expect(hasDraftContent({ rate: 3, thoughts: "", recommended: false })).toBe(true);
  });

  test("推薦をONにしただけでも下書きにする", () => {
    expect(hasDraftContent({ rate: 0, thoughts: "", recommended: true })).toBe(true);
  });
});

describe("isSameDraftContent", () => {
  test("評価・感想・推薦が同じなら同一とみなす", () => {
    expect(
      isSameDraftContent(
        { rate: 3, thoughts: "a", recommended: true, book: { bookId: 1 } },
        { rate: 3, thoughts: "a", recommended: true }
      )
    ).toBe(true);
  });

  test("null/undefinedと0/空文字/falseは同じ扱いにする", () => {
    expect(
      isSameDraftContent(
        { rate: null, thoughts: null, recommended: undefined },
        { rate: 0, thoughts: "", recommended: false }
      )
    ).toBe(true);
  });

  test("どれか1つでも違えば別内容", () => {
    const base = { rate: 3, thoughts: "a", recommended: false };
    expect(isSameDraftContent(base, { ...base, rate: 4 })).toBe(false);
    expect(isSameDraftContent(base, { ...base, thoughts: "b" })).toBe(false);
    expect(isSameDraftContent(base, { ...base, recommended: true })).toBe(false);
  });

  test("片方が無ければ別内容", () => {
    expect(isSameDraftContent(undefined, { rate: 0, thoughts: "", recommended: false })).toBe(false);
  });
});

describe("draftStatusLabel", () => {
  test("下書きがまだ無ければ自動保存されることを伝える", () => {
    expect(draftStatusLabel("idle", false)).toBe("Drafts are saved automatically");
  });

  test("下書きが保存済みならその旨を出す", () => {
    expect(draftStatusLabel("idle", true)).toBe("Draft saved");
    expect(draftStatusLabel("saved", true)).toBe("Draft saved");
  });

  test("保存中・失敗は下書きの有無より優先する", () => {
    expect(draftStatusLabel("saving", false)).toBe("Saving…");
    expect(draftStatusLabel("error", true)).toBe("Failed to save draft");
  });
});
