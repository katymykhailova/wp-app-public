import { useState } from "react";

import { format } from "date-fns";

import { useGetSalesByChannelQuery } from "@/store/services";

import MyDatePicker from "@/widgets/MyDatePicker";
import MyCharts from "@/widgets/MyCharts";

import { formatNumber } from "@/shared/util";

import s from "./SalesByChannel.module.scss";

const SalesByChannel = () => {
  const currentDay = new Date();
  const startOfMonth = new Date(
    currentDay.getFullYear(),
    currentDay.getMonth(),
    1,
  );

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(currentDay);

  const {
    data = [],
    isLoading,
    isError,
  } = useGetSalesByChannelQuery({
    dateStart: format(startDate, "yyyyMMdd"),
    dateEnd: format(endDate, "yyyyMMdd"),
  });

  const salesByChannel = data[0];

  const normalizeData = salesByChannel
    ? Object.entries(salesByChannel).map(([k, v]) => ({
        name: k,
        count: v,
      }))
    : [];

  let sortedRevenueData = [];
  let sortedCountData = [];
  normalizeData
    .filter(
      (e) =>
        !e.name?.toLowerCase().includes("gesamt") &&
        !e.name?.toLowerCase().includes("angebot") &&
        e.count,
    )
    .sort((a, b) => b.count - a.count)
    .forEach((e) => {
      e.name?.toLowerCase().startsWith("umsatz")
        ? sortedRevenueData.push(e)
        : sortedCountData.push(e);
    });

  const COLORS2 = ["#f29400", "#f6ad3c", "#f9c46c"];
  const COLORS = ["#34404c", "#66717c", "#a5adb5"];
  const chartConfig = {
    type: "pie",
    metrics: [
      {
        id: 1,
        data: sortedCountData,
        nameKey: "name",
        dataKey: "count",
        label: "Umsatz gesamt",
        colors: COLORS,
      },
      {
        id: 2,
        data: sortedRevenueData,
        nameKey: "name",
        dataKey: "count",
        label: "Anzahl Bestellungen",
        colors: COLORS2,
      },
    ],
  };

  return (
    <>
      <MyDatePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <h2>Bestellungen und Umsatz nach Vertriebskanal</h2>
      <div className={s.salesContainer}>
        {normalizeData?.length > 0 && (
          <div>
            <ul className={s.salesList}>
              {normalizeData.map(({ name: key, count }) => (
                <li key={key}>
                  {key}:{" "}
                  <span>
                    {key.toLowerCase().startsWith("umsatz")
                      ? formatNumber(count, "currency")
                      : formatNumber(count, "number")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {normalizeData?.length > 0 && (
          <div className={s.chart}>
            <MyCharts config={chartConfig} />
          </div>
        )}
      </div>
    </>
  );
};

export default SalesByChannel;
