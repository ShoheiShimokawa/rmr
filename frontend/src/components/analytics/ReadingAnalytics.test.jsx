import { render, screen } from "@testing-library/react";
import { ReadingAnalytics } from "./ReadingAnalytics";
import UserContext from "../UserProvider";
import { useAnalytics } from "../../hooks/useReading";

jest.mock("react-apexcharts", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-chart" />,
}));

jest.mock("../../hooks/useReading", () => ({
  useAnalytics: jest.fn(),
}));

const renderWithUser = () =>
  render(
    <UserContext.Provider value={{ user: { userId: 1 } }}>
      <ReadingAnalytics />
    </UserContext.Provider>
  );

const analyticsFixture = {
  summary: { done: 12, doneThisYear: 5, doneThisMonth: 1, doing: 2, toRead: 3, avgRate: 4.2 },
  status: { toRead: 3, doing: 2, done: 12 },
  monthly: [{ month: "2026-09", total: 1, byLargeGenre: { FICTION: 1 } }],
  yearly: [{ year: 2026, total: 5 }],
  genres: [{ largeGenre: "FICTION", count: 8 }],
  topAuthors: [{ author: "Haruki Murakami", count: 3 }],
};

describe("ReadingAnalytics", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("読み込み中はスピナーを表示する", () => {
    useAnalytics.mockReturnValue({ data: undefined, isLoading: true });

    renderWithUser();

    expect(document.querySelector(".loading-spinner")).toBeInTheDocument();
  });

  test("データが無い場合はNo dataを表示する", () => {
    useAnalytics.mockReturnValue({ data: undefined, isLoading: false });

    renderWithUser();

    expect(screen.getByText("No data.")).toBeInTheDocument();
  });

  test("データがある場合は各セクションを表示する", () => {
    useAnalytics.mockReturnValue({ data: analyticsFixture, isLoading: false });

    renderWithUser();

    expect(screen.getByText("Your Reading by Genre")).toBeInTheDocument();
    expect(screen.getByText("Monthly Reading Volume")).toBeInTheDocument();
    expect(screen.getByText("Yearly Trend")).toBeInTheDocument();
    expect(screen.getByText("Top Authors")).toBeInTheDocument();
  });
});
