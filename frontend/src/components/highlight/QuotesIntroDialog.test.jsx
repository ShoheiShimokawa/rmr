import { render, screen, fireEvent } from "@testing-library/react";
import { QuotesIntroDialog } from "./QuotesIntroDialog";

const setLanguage = (lang) => {
  Object.defineProperty(window.navigator, "language", {
    value: lang,
    configurable: true,
  });
};

describe("QuotesIntroDialog", () => {
  afterEach(() => {
    setLanguage("en-US");
  });

  test("日本語ロケールでは草枕の例を表示する", () => {
    setLanguage("ja-JP");
    render(<QuotesIntroDialog open onClose={jest.fn()} />);

    expect(screen.getByText("草枕")).toBeInTheDocument();
    expect(screen.getByText("夏目漱石")).toBeInTheDocument();
  });

  test("日本語以外のロケールでは英語の例を表示する", () => {
    setLanguage("en-US");
    render(<QuotesIntroDialog open onClose={jest.fn()} />);

    expect(screen.getByText("A Tale of Two Cities")).toBeInTheDocument();
    expect(screen.getByText("Charles Dickens")).toBeInTheDocument();
  });

  test("「Use in review」を押すとReviewへ引用が挿入され、Reviewタブに切り替わる", () => {
    render(<QuotesIntroDialog open onClose={jest.fn()} />);

    fireEvent.click(screen.getAllByRole("button", { name: /use in review/i })[0]);

    const reviewTextarea = screen.getByPlaceholderText("Your own thoughts on this book");
    expect(reviewTextarea.value).toContain("It was the best of times, it was the worst of times.");
  });

  test("Quotesタブで一節を入力してSave quoteを押すと一覧に追加される", () => {
    render(<QuotesIntroDialog open onClose={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Type or paste a line from the book"), {
      target: { value: "A brand new line." },
    });
    fireEvent.click(screen.getByRole("button", { name: /^save quote$/i }));

    expect(screen.getByText("A brand new line.", { exact: false })).toBeInTheDocument();
  });

  test("Got itを押すとonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    render(<QuotesIntroDialog open onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /got it/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
