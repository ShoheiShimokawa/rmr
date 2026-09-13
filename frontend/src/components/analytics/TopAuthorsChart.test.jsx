import { render } from "@testing-library/react";
import { TopAuthorsChart } from "./TopAuthorsChart";

// ApexChartsの横棒はcategories配列の先頭を上に描画するため、
// 渡した順序(=バックエンドで件数降順ソート済み)がそのまま保たれることを確認する。
// (先頭を反転して渡すと最も件数の少ない著者が一番上に表示されてしまう)
let receivedProps;
jest.mock("react-apexcharts", () => ({
  __esModule: true,
  default: (props) => {
    receivedProps = props;
    return <div data-testid="mock-chart" />;
  },
}));

describe("TopAuthorsChart", () => {
  test("件数の多い順のまま(反転せずに)ApexChartsへ渡す", () => {
    const topAuthors = [
      { author: "Haruki Murakami", count: 6 },
      { author: "Kazuo Ishiguro", count: 4 },
      { author: "Yuval Noah Harari", count: 3 },
    ];

    render(<TopAuthorsChart topAuthors={topAuthors} />);

    expect(receivedProps.options.xaxis.categories).toEqual([
      "Haruki Murakami",
      "Kazuo Ishiguro",
      "Yuval Noah Harari",
    ]);
    expect(receivedProps.series[0].data).toEqual([6, 4, 3]);
  });
});
