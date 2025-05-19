import {
  ChartContainer,
  PieChart,
  LineChart,
  ChartsItemTooltipContent,
  ChartsTooltip,
  LinePlot,
  ChartsXAxis,
  ChartsYAxis,
} from "@mui/x-charts";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { findReadingByUser } from "../api/reading";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { useState, useEffect } from "react";
import { getMonthlyData } from "../api/reading";

export const ReadingAnalytics = () => {
  const [data, setData] = useState([]);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);

  const maxValue = Math.max(...monthlyData.map((item) => item.total));

  const find = async () => {
    setLoading(true);
    const monthly = await getMonthlyData(user?.userId);
    setMonthlyData(monthly.data);

    const result = await findReadingByUser(user?.userId);

    const resulta = Object.entries(
      result.data.reduce((counts, reading) => {
        counts[reading.book.largeGenre] =
          (counts[reading.book.largeGenre] || 0) + 1; // カウント処理
        return counts;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .map(([largeGenre, count]) => ({ largeGenre, count }));
    const formattedData = resulta.map((l, index) => ({
      id: index + 1,
      value: l.count,
      label: l.largeGenre,
    }));
    setData(formattedData);
    setLoading(false);
  };

  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <div>
        <Card sx={{ p: 1, borderRadius: "13px", boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Trends by Genre
            </Typography>
            {data.length !== 0 && loading === false && (
              <div className="flex justify-start">
                <PieChart
                  series={[
                    {
                      data,
                    },
                  ]}
                  width={200}
                  height={250}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-5">
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: 2,
              borderRadius: "13px",
              boxShadow: 3,
              backgroundColor: "white",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Reading Volume
            </Typography>
            {monthlyData.length != 0 ? (
              // <ChartContainer
              //   width={500}
              //   height={300}
              //   series={[
              //     {
              //       type: "line",
              //       data: monthlyData.map((item) => item.total),
              //     },
              //   ]}
              //   xAxis={[
              //     {
              //       id: "month",
              //       data: monthlyData.map((item) => item.month),
              //       scaleType: "band",
              //     },
              //   ]}
              //   yAxis={[
              //     {
              //       min: 0,
              //       max: maxValue < 5 ? 5 : undefined,
              //       tickMinStep: 1,
              //     },
              //   ]}
              //   slotProps={{
              //     tooltip: {
              //       content: ({ dataIndex }) => {
              //         const pointData = monthlyData[dataIndex];
              //         return (
              //           <ChartsItemTooltipContent
              //             label={`Month: ${pointData.month} | Breakdown: ${pointData.breakdown}`}
              //             value={pointData.total}
              //           />
              //         );
              //       },
              //     },
              //   }}
              // >
              //   <LinePlot />
              //   <ChartsXAxis />
              //   <ChartsYAxis />
              // </ChartContainer>
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: monthlyData.map((item) => item.month),
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    tickMinStep: 1,
                    max: maxValue < 5 ? 5 : undefined,
                  },
                ]}
                series={[
                  {
                    data: monthlyData.map((item) => item.total),
                  },
                ]}
                width={450}
                height={300}
                slotProps={{
                  tooltip: {
                    content: ({ dataIndex, series }) => {
                      const pointData = monthlyData[dataIndex];
                      return (
                        <ChartsTooltip>
                          <ChartsItemTooltipContent
                            label={`Month: ${pointData.month}`}
                            value={pointData.total}
                            valueFormatter={`Breakdown: ${pointData.breakdown}`}
                          />
                        </ChartsTooltip>
                      );
                    },
                  },
                }}
              />
            ) : (
              // tooltip={{
              //   trigger: "item", // 各データポイントでツールチップを表示
              //   formatter: (params) => {
              //     const pointData = monthlyData[params.dataIndex];
              //     return `
              //                 <div>
              //                   <b>Month:</b> ${pointData.month}<br />
              //                   <b>Total:</b> ${pointData.total}<br />
              //                   <b>Breakdown:</b><br />
              //                   - Apples: ${pointData.breakdown}<br />
              //                   - Oranges: ${pointData.breakdown}
              //                 </div>
              //               `;
              //   },
              // }}
              <div>No data.</div>
            )}
          </Card>
        </Grid>
      </div>
    </div>
  );
};
