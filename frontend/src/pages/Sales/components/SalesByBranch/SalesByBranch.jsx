import { useState } from "react";
import { format } from "date-fns";

import { useGetSalesByBranchQuery } from "@/store/services";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

const SalesByBranch = () => {
  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { fields, data, totals, timeGranularity, filters, chartConfig } = {},
    isLoading,
    isFetching,
  } = useGetSalesByBranchQuery({
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
          chartConfig={chartConfig}
          totals={totals}
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

export default SalesByBranch;
