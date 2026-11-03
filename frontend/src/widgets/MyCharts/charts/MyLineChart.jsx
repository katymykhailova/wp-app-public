import { useMemo, Fragment } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "@/shared/util";

const MyLineChart = ({ config, data }) => {
  const { xKey, seriesKey, metrics = [] } = config;

  const COLORS = [
    "#f29400", // orange
    "#34404c", // graphite
    "#2f6f9f", // blue
    "#b84c3e", // brick red
    "#4f7d55", // green
    "#7b5a8e", // purple
    "#d46b00", // dark orange
    "#287c7e", // teal
    "#9b3f55", // raspberry
    "#657b3e", // olive green
    "#526d82", // steel blue
    "#a66a3f", // brown
    "#5360a8", // indigo
    "#bf8b2e", // ochre
    "#687078", // gray
  ];

  const seriesNames = useMemo(
    () => [...new Set(data.map((item) => item[seriesKey]))],
    [data, seriesKey],
  );

  const chartData = useMemo(() => {
    const groupedByX = Object.groupBy(data, (item) => item[xKey]);

    return metrics.map((metric) => ({
      metric,
      data: Object.entries(groupedByX).map(([xValue, items]) => ({
        [xKey]: xValue,
        ...Object.fromEntries(
          items.map((item) => [item[seriesKey], item[metric.dataKey]]),
        ),
      })),
    }));
  }, [data, xKey, seriesKey, metrics]);

  return (
    <>
      {chartData.map(({ metric, data: metricData }) => (
        <Fragment key={metric.dataKey}>
          <h3>{metric.label}</h3>
          <LineChart
            style={{
              width: "100%",
              // maxWidth: "700px",
              maxHeight: "70vh",
              aspectRatio: 1.618,
            }}
            responsive
            data={metricData}
            margin={{
              top: 20,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey={xKey} scale="band" />
            <YAxis width="auto" niceTicks="auto" />
            <Tooltip
              formatter={(value) => formatNumber(value ?? 0, metric.format)}
            />

            <Legend />
            {seriesNames.map((serie, i) => {
              return (
                <Line
                  key={serie}
                  dataKey={serie}
                  name={serie}
                  stroke={COLORS[i % COLORS.length]}
                />
              );
            })}
          </LineChart>
        </Fragment>
      ))}
    </>
  );
};
export default MyLineChart;
