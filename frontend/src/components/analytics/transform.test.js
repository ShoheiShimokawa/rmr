import { OTHER_KEY, foldGenres, monthKeysForSelection, fillMonths, yearOptions, monthlyDelta, yearlyDelta } from "./transform";

describe("foldGenres", () => {
  test("OTHER/UNKNOWNは常にOtherへ合算される", () => {
    const genres = [
      { largeGenre: "FICTION", count: 5 },
      { largeGenre: "OTHER", count: 2 },
      { largeGenre: "UNKNOWN", count: 1 },
    ];

    const result = foldGenres(genres, 7);

    expect(result).toEqual([
      { key: "FICTION", label: "Fiction", count: 5, color: expect.any(String) },
      { key: OTHER_KEY, label: "Other", count: 3, color: expect.any(String) },
    ]);
  });

  test("上位maxSlices件を超えた分はOtherへ畳み込まれる", () => {
    const genres = [
      { largeGenre: "FICTION", count: 10 },
      { largeGenre: "NON_FICTION", count: 9 },
      { largeGenre: "PROFESSIONAL_TECHNICAL", count: 8 },
      { largeGenre: "ACADEMICS_RESEARCH", count: 3 },
    ];

    const result = foldGenres(genres, 2);

    expect(result.map((r) => r.key)).toEqual(["FICTION", "NON_FICTION", OTHER_KEY]);
    expect(result[2].count).toBe(11);
  });

  test("Otherに畳み込む対象が無ければOtherバケットを作らない", () => {
    const genres = [{ largeGenre: "FICTION", count: 1 }];

    const result = foldGenres(genres, 7);

    expect(result).toEqual([{ key: "FICTION", label: "Fiction", count: 1, color: expect.any(String) }]);
  });
});

describe("monthKeysForSelection", () => {
  test("last12は当月を含む直近12ヶ月を昇順で返す", () => {
    const today = new Date(2026, 8, 13); // 2026-09-13 (JS月は0始まり)

    const keys = monthKeysForSelection("last12", today);

    expect(keys).toHaveLength(12);
    expect(keys[0]).toBe("2025-10");
    expect(keys[11]).toBe("2026-09");
  });

  test("年を指定すると1月から12月までを返す", () => {
    const keys = monthKeysForSelection(2025);

    expect(keys).toEqual([
      "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
      "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    ]);
  });
});

describe("fillMonths", () => {
  test("欠けている月をtotal 0で埋め、指定した順序に揃える", () => {
    const monthly = [{ month: "2026-09", total: 3, byLargeGenre: { FICTION: 3 } }];

    const result = fillMonths(monthly, ["2026-08", "2026-09"]);

    expect(result).toEqual([
      { month: "2026-08", total: 0, byLargeGenre: {} },
      { month: "2026-09", total: 3, byLargeGenre: { FICTION: 3 } },
    ]);
  });
});

describe("yearOptions", () => {
  test("年を降順で返す", () => {
    const yearly = [{ year: 2024, total: 1 }, { year: 2026, total: 2 }, { year: 2025, total: 3 }];

    expect(yearOptions(yearly)).toEqual([2026, 2025, 2024]);
  });
});

describe("monthlyDelta", () => {
  test("今月と先月の合計を返す(データが無い月は0)", () => {
    const today = new Date(2026, 8, 13); // 2026-09
    const monthly = [
      { month: "2026-08", total: 2, byLargeGenre: {} },
      { month: "2026-09", total: 5, byLargeGenre: {} },
    ];

    expect(monthlyDelta(monthly, today)).toEqual({ current: 5, previous: 2, month: "2026-09" });
  });

  test("データが無い月は0として扱う", () => {
    const today = new Date(2026, 8, 13);

    expect(monthlyDelta([], today)).toEqual({ current: 0, previous: 0, month: "2026-09" });
  });
});

describe("yearlyDelta", () => {
  test("最新年と前年の合計を返す", () => {
    const yearly = [{ year: 2024, total: 2 }, { year: 2025, total: 29 }];

    expect(yearlyDelta(yearly)).toEqual({ current: 29, previous: 2, year: 2025 });
  });

  test("前年のデータが無ければpreviousは0", () => {
    const yearly = [{ year: 2026, total: 3 }];

    expect(yearlyDelta(yearly)).toEqual({ current: 3, previous: 0, year: 2026 });
  });

  test("年データが無ければnull", () => {
    expect(yearlyDelta([])).toBeNull();
  });
});
