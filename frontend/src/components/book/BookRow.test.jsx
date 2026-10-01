import { render, screen, fireEvent } from "@testing-library/react";
import { BookRow } from "./BookRow";

describe("BookRow", () => {
  test("loading中はSkeletonを表示し、本文は表示しない", () => {
    const { container } = render(<BookRow title="Popular" loading items={[]} />);

    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0);
  });

  test("itemsが空でemptyTextがあれば、その文言を表示する", () => {
    render(<BookRow title="From people you follow" loading={false} items={[]} emptyText="Nothing yet." />);

    expect(screen.getByText("Nothing yet.")).toBeInTheDocument();
  });

  test("itemsが空でemptyTextも無ければ何も描画しない", () => {
    const { container } = render(<BookRow title="Popular" loading={false} items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("本をタップするとonSelectにその本を渡して呼ぶ", () => {
    const onSelect = jest.fn();
    const book = { bookId: 1, title: "Title" };
    render(
      <BookRow
        title="Popular"
        loading={false}
        items={[{ key: 1, book, caption: "12 readers" }]}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText("Title"));

    expect(onSelect).toHaveBeenCalledWith(book);
  });

  test("captionを表示する", () => {
    const book = { bookId: 1, title: "Title" };
    render(
      <BookRow title="Top rated" loading={false} items={[{ key: 1, book, caption: "★4.6 (5)" }]} />
    );

    expect(screen.getByText("★4.6 (5)")).toBeInTheDocument();
  });
});
