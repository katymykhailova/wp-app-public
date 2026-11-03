import { useMemo } from "react";

import { Pie, PieChart, Tooltip, Sector } from "recharts";
import { formatNumber } from "@/shared/util";

const MyPieChart = ({ config }) => {
  const { metrics: series = [] } = config;
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (
      cx == null ||
      cy == null ||
      innerRadius == null ||
      outerRadius == null
    ) {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#212830"
        textAnchor={x > ncx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };

  const seriesByDataKey = useMemo(
    () => Object.fromEntries(series.map((serie) => [serie.dataKey, serie])),
    [series],
  );

  const formaterNumber = (value, name, entry) => {
    const format = seriesByDataKey[entry.dataKey]?.format ?? "count";
    return formatNumber(value ?? 0, format);
  };

  return (
    <PieChart
      style={{
        width: "80%",
        height: "80%",
        maxWidth: "500px",
        maxHeight: "80vh",
        aspectRatio: 1,
      }}
      responsive
    >
      {series.map((serie, i) => (
        <Pie
          key={serie.id}
          data={serie.data}
          dataKey={serie.dataKey}
          nameKey={serie.nameKey}
          cx="50%"
          cy="50%"
          innerRadius={i > 0 ? `${30 + i * 30}%` : false}
          outerRadius={`${50 + i * 30}%`}
          fill="#8884d8"
          isAnimationActive={true}
          label={i > 0 ? renderCustomizedLabel : false}
          labelLine={false}
          shape={(props) => (
            <Sector
              {...props}
              fill={serie.colors[props.index % serie.colors.length]}
            />
          )}
        />
      ))}
      <Tooltip
        contentStyle={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          padding: "8px 12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
        }}
        labelStyle={{
          color: "#374151",
          fontWeight: 600,
        }}
        itemStyle={{
          color: "#f29400",
          fontSize: "13px",
        }}
        formatter={formaterNumber}
      />
    </PieChart>
  );
};
export default MyPieChart;
