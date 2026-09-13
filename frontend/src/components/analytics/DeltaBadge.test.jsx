import { render, screen } from "@testing-library/react";
import { DeltaBadge } from "./DeltaBadge";

describe("DeltaBadge", () => {
  test("両方0件なら何も表示しない", () => {
    const { container } = render(<DeltaBadge current={0} previous={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  test("前期間が0件のときは%ではなく件数の差で表示する", () => {
    render(<DeltaBadge current={5} previous={0} />);

    expect(screen.getByText("+5")).toBeInTheDocument();
  });

  test("増加は%表示で淡いミント背景+濃い緑文字のバッジになる", () => {
    render(<DeltaBadge current={12} previous={10} />);

    const badge = screen.getByText("+20%");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-emerald-100");
    expect(badge.className).toContain("text-emerald-600");
  });

  test("減少は%表示でグレー(中立)バッジになる", () => {
    render(<DeltaBadge current={5} previous={10} />);

    const badge = screen.getByText("-50%");
    expect(badge).toBeInTheDocument();
    expect(badge.className).not.toContain("emerald");
  });

  test("増減なしはグレー(中立)バッジになる", () => {
    render(<DeltaBadge current={10} previous={10} />);

    const badge = screen.getByText("0%");
    expect(badge.className).not.toContain("emerald");
  });
});
