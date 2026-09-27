import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useBookSuggestions } from "./useBookSuggestions";
import * as api from "../api/book";

jest.mock("../api/book");

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useBookSuggestions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("2文字未満の検索語ではリクエストしない", () => {
    renderHook(() => useBookSuggestions("h"), { wrapper: createWrapper() });

    expect(api.suggestBooks).not.toHaveBeenCalled();
  });

  test("日本語は1文字でもリクエストする", async () => {
    api.suggestBooks.mockResolvedValue({
      data: { items: [{ type: "TITLE", text: "嫌われる勇気" }] },
    });

    const { result } = renderHook(() => useBookSuggestions("嫌"), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data).toEqual([{ type: "TITLE", text: "嫌われる勇気" }])
    );
    expect(api.suggestBooks).toHaveBeenCalledWith(
      "嫌",
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  test("enabledがfalseの間はリクエストしない", () => {
    renderHook(() => useBookSuggestions("harry", { enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(api.suggestBooks).not.toHaveBeenCalled();
  });

  test("2文字以上ならリクエストし、結果をそのまま返す", async () => {
    api.suggestBooks.mockResolvedValue({
      data: { items: [{ type: "AUTHOR", text: "村上春樹" }] },
    });

    const { result } = renderHook(() => useBookSuggestions("murakami"), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.data).toEqual([{ type: "AUTHOR", text: "村上春樹" }])
    );
  });
});
