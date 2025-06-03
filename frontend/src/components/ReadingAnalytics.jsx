import {
  PieChart,
  LineChart,
  ChartsItemTooltipContent,
  ChartsTooltip,
} from "@mui/x-charts";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { findReadingByUser } from "../api/reading";
import { useContext } from "react";
import UserContext from "./UserProvider";
import { useState, useEffect } from "react";
import { getMonthlyData } from "../api/reading";
import { toLargeGenre } from "../util";

export const ReadingAnalytics = () => {
  const [data, setData] = useState([]);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);

  const maxValue = Math.max(...monthlyData.map((item) => item.total));

  const find = async () => {
    setLoading(true);
    if (user) {
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
        label: toLargeGenre(l.largeGenre),
      }));
      setData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    find();
  }, []);

  return (
    <div>
      <div>
        <Card
          sx={{
            p: 1,
            borderRadius: "13px",
            boxShadow: 3,
            height: 350,
            width: 700,
          }}
        >
          <CardContent>
            <div className="font-soft text-xl font-bold">Trends by Genre</div>
            {data.length !== 0 && loading === false ? (
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
            ) : (
              <div className="flex justify-center items-center min-h-[200px] text-zinc-500">
                No data.
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
              height: 350,
              width: 700,
            }}
          >
            <div className="font-soft text-xl font-bold">
              Monthly Reading Volume
            </div>
            {monthlyData.length != 0 ? (
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
                width={500}
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
              <div className="flex justify-center items-center min-h-[200px] text-zinc-500">
                No data.
              </div>
            )}
          </Card>
        </Grid>
      </div>
    </div>
  );
};
