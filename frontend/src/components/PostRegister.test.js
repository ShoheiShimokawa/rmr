import { recentShelf } from "./PostRegister";

const reading = (overrides) => ({
  readingId: 1,
  statusType: "NONE",
  book: { bookId: 1 },
  ...overrides,
});

describe("recentShelf", () => {
  test("削除済み(INVALID)を除外する", () => {
    const readings = [
      reading({ readingId: 1, statusType: "NONE", book: { bookId: 1 } }),
      reading({ readingId: 3, statusType: "DOING", book: { bookId: 3 } }),
      reading({ readingId: 4, statusType: "INVALID", book: { bookId: 4 } }),
    ];

    const result = recentShelf(readings);

    expect(result.map((r) => r.readingId).sort()).toEqual([1, 3]);
  });

  test("Post済み(DONEでrateかthoughtsがある)は棚から除外し、未投稿(DONEだが空)は含める", () => {
    const readings = [
      reading({ readingId: 1, statusType: "DONE", book: { bookId: 1 }, rate: 4, thoughts: "" }),
      reading({
        readingId: 2,
        statusType: "DONE",
        book: { bookId: 2 },
        rate: 0,
        thoughts: "great read",
      }),
      reading({ readingId: 3, statusType: "DONE", book: { bookId: 3 }, rate: 0, thoughts: "" }),
    ];

    const result = recentShelf(readings);

    expect(result.map((r) => r.readingId)).toEqual([3]);
  });

  test("最後にさわった日時(updateDate優先)の新しい順に並べる", () => {
    const readings = [
      reading({
        readingId: 1,
        book: { bookId: 1 },
        registerDate: "2026-01-01T00:00:00Z",
        toReadDate: "2026-01-01T00:00:00Z",
        updateDate: "2026-01-01T00:00:00Z",
      }),
      reading({
        readingId: 2,
        statusType: "DOING",
        book: { bookId: 2 },
        registerDate: "2026-01-02T00:00:00Z",
        readingDate: "2026-01-05T00:00:00Z",
      }),
      reading({
        readingId: 3,
        statusType: "DONE",
        book: { bookId: 3 },
        registerDate: "2026-01-03T00:00:00Z",
        updateDate: "2026-01-10T00:00:00Z",
      }),
    ];

    const result = recentShelf(readings);

    expect(result.map((r) => r.readingId)).toEqual([3, 2, 1]);
  });

  test("日付が全く無い読書は末尾に回す(新しい方が先)", () => {
    const readings = [
      reading({ readingId: 1, book: { bookId: 1 } }),
      reading({
        readingId: 2,
        book: { bookId: 2 },
        toReadDate: "2026-01-01T00:00:00Z",
      }),
    ];

    const result = recentShelf(readings);

    expect(result.map((r) => r.readingId)).toEqual([2, 1]);
  });

  test("上限を超えた分は新しい順に切り捨てる", () => {
    const readings = Array.from({ length: 5 }, (_, i) =>
      reading({
        readingId: i + 1,
        book: { bookId: i + 1 },
        updateDate: `2026-01-0${i + 1}T00:00:00Z`,
      })
    );

    const result = recentShelf(readings, 3);

    expect(result.map((r) => r.readingId)).toEqual([5, 4, 3]);
  });

  test("元の配列を破壊しない", () => {
    const readings = [
      reading({ readingId: 1, book: { bookId: 1 } }),
      reading({ readingId: 2, book: { bookId: 2 } }),
    ];
    const original = [...readings];

    recentShelf(readings);

    expect(readings).toEqual(original);
  });

  test("空配列やundefinedを渡してもエラーにならない", () => {
    expect(recentShelf([])).toEqual([]);
    expect(recentShelf(undefined)).toEqual([]);
  });
});
