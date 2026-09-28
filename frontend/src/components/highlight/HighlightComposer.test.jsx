import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HighlightComposer } from "./HighlightComposer";
import { useHighlightMutations, useMyHighlights } from "../../hooks/useHighlight";

jest.mock("../../hooks/useHighlight", () => ({
  useHighlightMutations: jest.fn(),
  useMyHighlights: jest.fn(),
}));

jest.mock("../../hooks/NotifyProvider", () => ({
  useNotify: () => ({ notify: jest.fn() }),
}));

const baseReading = {
  readingId: 1,
  book: { bookId: 1, title: "Test Book", author: "Author" },
  user: { userId: 2 },
};

describe("HighlightComposer", () => {
  const createHighlight = jest.fn();
  const updateHighlight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useHighlightMutations.mockReturnValue({ createHighlight, updateHighlight });
    useMyHighlights.mockReturnValue({ data: [] });
  });

  test("一文が空のままでは保存できない", async () => {
    render(<HighlightComposer reading={baseReading} entryPoint="record" />);

    fireEvent.click(screen.getByRole("button", { name: /save highlight/i }));

    expect(await screen.findByText("A line is required.")).toBeInTheDocument();
    expect(createHighlight).not.toHaveBeenCalled();
  });

  test("500字を超える一文はエラーを表示して保存しない", async () => {
    render(<HighlightComposer reading={baseReading} entryPoint="record" />);
    const textarea = screen.getByPlaceholderText(/type or paste the line/i);

    fireEvent.change(textarea, { target: { value: "a".repeat(501) } });
    fireEvent.click(screen.getByRole("button", { name: /save highlight/i }));

    expect(await screen.findByText(/500 characters or fewer/i)).toBeInTheDocument();
    expect(createHighlight).not.toHaveBeenCalled();
  });

  test("有効な一文を入力すると保存される", async () => {
    createHighlight.mockResolvedValue({});
    render(<HighlightComposer reading={baseReading} entryPoint="record" />);
    const textarea = screen.getByPlaceholderText(/type or paste the line/i);

    fireEvent.change(textarea, { target: { value: "A meaningful line." } });
    fireEvent.click(screen.getByRole("button", { name: /save highlight/i }));

    await waitFor(() =>
      expect(createHighlight).toHaveBeenCalledWith(
        expect.objectContaining({ readingId: 1, quote: "A meaningful line." }),
        { ownerId: 2 }
      )
    );
  });

  test("改行を含む一文には「Join lines」ボタンが表示され、押すと1行に詰める", () => {
    render(<HighlightComposer reading={baseReading} entryPoint="record" />);
    const textarea = screen.getByPlaceholderText(/type or paste the line/i);

    fireEvent.change(textarea, { target: { value: "first line\nsecond line" } });
    expect(screen.getByRole("button", { name: /join lines/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /join lines/i }));

    expect(textarea.value).toBe("first line second line");
  });

  test("改行を含まない一文には「Join lines」ボタンを表示しない", () => {
    render(<HighlightComposer reading={baseReading} entryPoint="record" />);
    const textarea = screen.getByPlaceholderText(/type or paste the line/i);

    fireEvent.change(textarea, { target: { value: "single line" } });

    expect(screen.queryByRole("button", { name: /join lines/i })).not.toBeInTheDocument();
  });
});
