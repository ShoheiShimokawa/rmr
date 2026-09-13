// react-apexchartsが依存するapexchartsパッケージはCRAのjest(jsdom)環境では
// 正しく解決できないため(ESM/ブラウザ専用エントリを要求する)、テストでは
// チャート描画を行わないダミーコンポーネントに差し替える。
import React from "react";

const Chart = () => React.createElement("div", { "data-testid": "apexchart" });

export default Chart;
