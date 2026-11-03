import { useMemo, Fragment } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Scatter,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber } from "@/shared/util";

const MyComposedChart = ({ config, data }) => {
  const { xKey, metrics: series = [] } = config;
  const seriesComponents = [Area, Bar, Line, Scatter];
  const groupedData = useMemo(() => {
    if (!config.groupBy) {
      return { default: data };
    }

    return Object.groupBy(data, (item) => item[config.groupBy]);
  }, [data, config.groupBy]);

  const maxGroupSize = Math.max(
    ...Object.values(groupedData).map((group) => group.length),
  );
  const barSizes = [
    [5, 40],
    [10, 25],
    [20, 15],
    [40, 10],
    [80, 6],
  ];

  const barSize =
    barSizes.find(([maxItems]) => maxGroupSize <= maxItems)?.[1] ?? 3;

  const COLORS = [
    "#34404c",
    "#f29400",
    "#c85f00",
    "#596875",
    "#ffbd3e",
    "#8996a3",
  ];

  const seriesByDataKey = useMemo(
    () => Object.fromEntries(series.map((serie) => [serie.dataKey, serie])),
    [series],
  );

  const formatterNumber = (value, name, entry) => {
    const format = seriesByDataKey[entry.dataKey]?.format ?? "count";
    return formatNumber(value ?? 0, format);
  };

  return (
    <>
      {Object.entries(groupedData).map(([group, groupData]) => (
        <Fragment key={group}>
          <h3>{group}</h3>
          <ComposedChart
            style={{
              width: "100%",
              // maxWidth: "800px",
              maxHeight: "70vh",
              aspectRatio: 1.618,
            }}
            responsive
            data={groupData}
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
            <Tooltip formatter={formatterNumber} />
            <Legend />
            {series.map((serie, i) => {
              const Component =
                maxGroupSize > 100 ? Line : (seriesComponents[i] ?? Line);

              return (
                <Component
                  barSize={barSize}
                  key={serie.dataKey}
                  dataKey={serie.dataKey}
                  name={serie.label}
                  fill={COLORS[i % COLORS.length]}
                  stroke={COLORS[i % COLORS.length]}
                />
              );
            })}
          </ComposedChart>
        </Fragment>
      ))}
    </>
  );
};
export default MyComposedChart;
