import { PieChart, LineChart } from '@mui/x-charts';
import { BarChart } from '@mui/x-charts/BarChart';
import { findReadingByUser } from "../api/reading"
import { useContext } from 'react';
import UserContext from './UserProvider';
import { useState, useEffect } from "react"
import { getMonthlyData } from "../api/reading";

export const ReadingAnalytics = () => {
    const [data, setData] = useState([]);
    const { user } = useContext(UserContext);
    const [loading, setLoading] = useState(false)
    const [monthlyData, setMonthlyData] = useState([]);

    const find = async () => {
        setLoading(true)
        const monthly = await getMonthlyData(user?.userId);
        console.log(monthly)
        setMonthlyData(monthly.data);
        console.log(monthly.data)
        const result = await findReadingByUser(user?.userId);

        const resulta = Object.entries(
            result.data.reduce((counts, reading) => {
                counts[reading.book.largeGenre] = (counts[reading.book.largeGenre] || 0) + 1; // カウント処理
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
        setData(formattedData)
        setLoading(false)
    }

    useEffect(() => {
        find();
    }, []);

    return (
        <div>
            <div>
                by genre
                {data.length !== 0 && loading === false &&
                    <PieChart
                        series={[{
                            data
                        }]
                        }
                        width={700}
                        height={200}
                    />
                }
            </div>
            <div>
                <div>Monthly</div>
                {monthlyData.length != 0 &&
                    <LineChart
                        xAxis={[{
                            scaleType: 'band',
                            data: monthlyData.map(item => (
                                item.month
                            ))
                        }]}
                        yAxis={[
                            {
                                min: 0, // Y軸の最小値
                            },
                        ]}
                        series={[
                            {
                                data: monthlyData.map(item => (
                                    item.total
                                )),
                            },
                        ]}
                        width={500}
                        height={300}
                        tooltip={{
                            trigger: 'item', // 各データポイントでツールチップを表示
                            formatter: (params) => {
                                const pointData = monthlyData[params.dataIndex];
                                return `
                                <div>
                                  <b>Month:</b> ${pointData.month}<br />
                                  <b>Total:</b> ${pointData.total}<br />
                                  <b>Breakdown:</b><br />
                                  - Apples: ${pointData.breakdown}<br />
                                  - Oranges: ${pointData.breakdown}
                                </div>
                              `;
                            },
                        }}
                    />
                }
            </div>
        </div>
    )
}