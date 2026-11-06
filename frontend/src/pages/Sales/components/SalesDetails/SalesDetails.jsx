import { useState } from "react";

import { format } from "date-fns";

import { useGetSalesDetailsQuery } from "@/store/services";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

const SalesDetails = () => {
  const currentDay = new Date();
  const startOfMonth = new Date(
    currentDay.getFullYear(),
    currentDay.getMonth(),
    1,
  );

  const [startDate, setStartDate] = useState(startOfMonth);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { fields, data, filters, timeGranularity, totals } = {},
    isLoading,
    isFetching,
  } = useGetSalesDetailsQuery({
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
          timeGranularity={timeGranularity}
          totals={totals}
          // chartConfig={chartConfig}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onParamsChange={setQueryParams}
        />
      )}
    </>
  );
};

export default SalesDetails;
