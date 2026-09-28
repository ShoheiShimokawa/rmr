import { track, trackOnce } from "./tracking";

describe("track", () => {
  afterEach(() => {
    delete window.gtag;
    jest.restoreAllMocks();
  });

  test("gtagが存在する場合はイベント名とパラメータを渡して呼び出す", () => {
    window.gtag = jest.fn();

    track("highlight_create", { entry_point: "record" });

    expect(window.gtag).toHaveBeenCalledWith("event", "highlight_create", { entry_point: "record" });
  });

  test("gtagが存在しない場合は何もせず、エラーも投げない", () => {
    expect(() => track("highlight_create", { entry_point: "record" })).not.toThrow();
  });

  test("真偽値は1/0に変換して送る", () => {
    window.gtag = jest.fn();

    track("highlight_create", { has_note: true, has_page: false });

    expect(window.gtag).toHaveBeenCalledWith("event", "highlight_create", { has_note: 1, has_page: 0 });
  });

  test("undefined/nullの値は送らない", () => {
    window.gtag = jest.fn();

    track("highlight_create", { entry_point: undefined, label: null, other: "x" });

    expect(window.gtag).toHaveBeenCalledWith("event", "highlight_create", { other: "x" });
  });

  test("文字列は100文字を超える分を切り詰める", () => {
    window.gtag = jest.fn();
    const longValue = "a".repeat(150);

    track("highlight_create", { note: longValue });

    expect(window.gtag).toHaveBeenCalledWith("event", "highlight_create", { note: "a".repeat(100) });
  });

  test("gtagが例外を投げても呼び出し元には伝播しない", () => {
    window.gtag = jest.fn(() => {
      throw new Error("boom");
    });

    expect(() => track("highlight_create")).not.toThrow();
  });
});

describe("trackOnce", () => {
  afterEach(() => {
    delete window.gtag;
  });

  test("同じキーでの2回目以降の呼び出しは送信しない", () => {
    window.gtag = jest.fn();

    trackOnce("dedupe-same-key", "daily_line_view", { surface: "highlights_page" });
    trackOnce("dedupe-same-key", "daily_line_view", { surface: "highlights_page" });

    expect(window.gtag).toHaveBeenCalledTimes(1);
  });

  test("キーが異なれば別イベントとして送信する", () => {
    window.gtag = jest.fn();

    trackOnce("dedupe-key-a", "daily_line_view", { surface: "home" });
    trackOnce("dedupe-key-b", "daily_line_view", { surface: "highlights_page" });

    expect(window.gtag).toHaveBeenCalledTimes(2);
  });
});
