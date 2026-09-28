import { render, screen } from "@testing-library/react";
import { HighlightList } from "./HighlightList";
import { useHighlightMutations } from "../../hooks/useHighlight";

jest.mock("../../hooks/useHighlight", () => ({
  useHighlightMutations: jest.fn(),
}));

jest.mock("../../hooks/NotifyProvider", () => ({
  useNotify: () => ({ notify: jest.fn() }),
}));

const highlights = [
  { memoId: 1, quote: "quote one", page: 5, book: { bookId: 10, title: "Book A", author: "Author A" } },
  { memoId: 2, quote: "quote two", page: 6, book: { bookId: 10, title: "Book A", author: "Author A" } },
  { memoId: 3, quote: "quote three", book: { bookId: 20, title: "Book B", author: "Author B" } },
];

describe("HighlightList", () => {
  beforeEach(() => {
    useHighlightMutations.mockReturnValue({ deleteHighlight: jest.fn() });
  });

  test("groupByBookがfalseのときは本ごとにカードを分けて表示し、書名を件数分繰り返す", () => {
    render(<HighlightList highlights={highlights} ownerId={1} />);

    expect(screen.getAllByText("Book A / Author A", { exact: false })).toHaveLength(2);
  });

  test("groupByBookがtrueのときは本ごとにまとめ、書名を1回だけ出す", () => {
    render(<HighlightList highlights={highlights} ownerId={1} groupByBook />);

    expect(screen.getAllByText("Book A")).toHaveLength(1);
    expect(screen.getByText("quote one", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("quote two", { exact: false })).toBeInTheDocument();
    expect(screen.getAllByText("Book B")).toHaveLength(1);
  });
});
