import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HighlightComposer } from "./HighlightComposer";
import { useHighlightMutations, useMyHighlights } from "../../hooks/useHighlight";
import { useReading } from "../../hooks/useReading";
import UserContext from "../UserProvider";

jest.mock("../../hooks/useHighlight", () => ({
  useHighlightMutations: jest.fn(),
  useMyHighlights: jest.fn(),
}));

jest.mock("../../hooks/useReading", () => ({
  useReading: jest.fn(),
}));

jest.mock("../../hooks/NotifyProvider", () => ({
  useNotify: () => ({ notify: jest.fn() }),
}));

const baseUser = { userId: 2, handle: "reader" };

const baseReading = {
  readingId: 1,
  book: { bookId: 1, title: "Test Book", author: "Author" },
  user: { userId: 2 },
};

const renderComposer = (props) =>
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: baseUser }}>
        <HighlightComposer reading={baseReading} entryPoint="record" {...props} />
      </UserContext.Provider>
    </MemoryRouter>
  );

describe("HighlightComposer", () => {
  const createHighlight = jest.fn();
  const updateHighlight = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useHighlightMutations.mockReturnValue({ createHighlight, updateHighlight });
    useMyHighlights.mockReturnValue({ data: [] });
    useReading.mockReturnValue({
      getByUserIdAndBookId: jest.fn(),
      registerReading: jest.fn(),
    });
  });

  test("一文が空のままでは保存できない", async () => {
    renderComposer();

    fireEvent.click(screen.getByRole("button", { name: /save quote/i }));

    expect(await screen.findByText("A line is required.")).toBeInTheDocument();
    expect(createHighlight).not.toHaveBeenCalled();
  });

  test("500字を超える一文はエラーを表示して保存しない", async () => {
    renderComposer();
    const textarea = screen.getByPlaceholderText(/type or paste a line/i);

    fireEvent.change(textarea, { target: { value: "a".repeat(501) } });
    fireEvent.click(screen.getByRole("button", { name: /save quote/i }));

    expect(await screen.findByText(/500 characters or fewer/i)).toBeInTheDocument();
    expect(createHighlight).not.toHaveBeenCalled();
  });

  test("有効な一文を入力すると保存される", async () => {
    createHighlight.mockResolvedValue({});
    renderComposer();
    const textarea = screen.getByPlaceholderText(/type or paste a line/i);

    fireEvent.change(textarea, { target: { value: "A meaningful line." } });
    fireEvent.click(screen.getByRole("button", { name: /save quote/i }));

    await waitFor(() =>
      expect(createHighlight).toHaveBeenCalledWith(
        expect.objectContaining({ readingId: 1, quote: "A meaningful line." }),
        { ownerId: 2 }
      )
    );
  });

  test("読書がまだ無い本では、保存時に読書中として自動登録してから作成する", async () => {
    const getByUserIdAndBookId = jest.fn().mockResolvedValue({ data: null });
    const registerReading = jest.fn().mockResolvedValue({ data: { readingId: 99 } });
    useReading.mockReturnValue({ getByUserIdAndBookId, registerReading });
    createHighlight.mockResolvedValue({});
    renderComposer({ reading: undefined, book: { bookId: 5, id: "source-5" } });
    const textarea = screen.getByPlaceholderText(/type or paste a line/i);

    fireEvent.change(textarea, { target: { value: "A meaningful line." } });
    fireEvent.click(screen.getByRole("button", { name: /save quote/i }));

    await waitFor(() =>
      expect(registerReading).toHaveBeenCalledWith(
        expect.objectContaining({ bookId: 5, userId: 2, statusType: "DOING" }),
        { sourceId: "source-5" }
      )
    );
    expect(createHighlight).toHaveBeenCalledWith(
      expect.objectContaining({ readingId: 99 }),
      { ownerId: 2 }
    );
  });

  test("改行を含む一文には「Join lines」ボタンが表示され、押すと1行に詰める", () => {
    renderComposer();
    const textarea = screen.getByPlaceholderText(/type or paste a line/i);

    fireEvent.change(textarea, { target: { value: "first line\nsecond line" } });
    expect(screen.getByRole("button", { name: /join lines/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /join lines/i }));

    expect(textarea.value).toBe("first line second line");
  });

  test("改行を含まない一文には「Join lines」ボタンを表示しない", () => {
    renderComposer();
    const textarea = screen.getByPlaceholderText(/type or paste a line/i);

    fireEvent.change(textarea, { target: { value: "single line" } });

    expect(screen.queryByRole("button", { name: /join lines/i })).not.toBeInTheDocument();
  });
});
