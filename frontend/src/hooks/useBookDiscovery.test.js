import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { useTopRatedBooks, usePopularBooks, useFollowingBooks } from "./useBookDiscovery";
import * as api from "../api/book";

jest.mock("../api/book");

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTopRatedBooks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("評価の高い本の一覧をそのまま返す", async () => {
    const items = [{ book: { bookId: 1, title: "Title" }, averageRating: 4.6, ratingCount: 5, recommendCount: 3 }];
    api.getTopRatedBooks.mockResolvedValue({ data: { items } });

    const { result } = renderHook(() => useTopRatedBooks(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(items));
  });

  test("itemsが無ければ空配列を返す", async () => {
    api.getTopRatedBooks.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => useTopRatedBooks(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});

describe("usePopularBooks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("今読まれている本の一覧をそのまま返す", async () => {
    const items = [{ book: { bookId: 1, title: "Title" }, readerCount: 12 }];
    api.getPopularBooks.mockResolvedValue({ data: { items } });

    const { result } = renderHook(() => usePopularBooks(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(items));
  });
});

describe("useFollowingBooks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("viewerIdが無ければリクエストしない(未ログイン)", () => {
    renderHook(() => useFollowingBooks(undefined), { wrapper: createWrapper() });

    expect(api.getFollowingBooks).not.toHaveBeenCalled();
  });

  test("viewerIdがあればリクエストし、結果を返す", async () => {
    const items = [{ book: { bookId: 1, title: "Title" }, readers: [], latestStatus: "DOING" }];
    api.getFollowingBooks.mockResolvedValue({ data: { items } });

    const { result } = renderHook(() => useFollowingBooks(42), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(items));
    expect(api.getFollowingBooks).toHaveBeenCalled();
  });
});
