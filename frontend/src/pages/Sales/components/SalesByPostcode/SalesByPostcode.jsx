import { useState } from "react";

import { format } from "date-fns";

import { useGetSalesByPostcodeQuery } from "@/store/services";

import Report from "@/widgets/Report";

import Spinner from "@/shared/ui/Spinner";

import s from "./SalesByPostcode.module.scss";

const SalesByPostcode = () => {
  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);
  const defaultFields = [
    "plz",
    "umsatz_gesamt",
    "plz_gruppe",
    "filiale",
    "umsatz_neukunden",
    "umsatz_bestandskunden",
  ].sort();
  const initialParams = { fields: defaultFields };

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({
    fields: defaultFields,
  });

  const {
    data: { fields, data, filters, totals, chartConfig } = {},
    isLoading,
    isFetching,
  } = useGetSalesByPostcodeQuery({
    dateStart: format(startDate, "yyyyMMdd"),
    dateEnd: format(endDate, "yyyyMMdd"),
    ...queryParams,
  });

  return (
    <>
      {(isLoading || isFetching) && <Spinner />}
      {data && (
        <Report
          data={data}
          fields={fields}
          filters={filters}
          totals={totals}
          chartConfig={chartConfig}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onParamsChange={setQueryParams}
          defaultMode="chart"
          initialParams={initialParams}
        />
      )}
    </>
  );
};
export default SalesByPostcode;
