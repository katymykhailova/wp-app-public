import { useState } from "react";
import { format } from "date-fns";

import { useGetMonthlyCustomerStatisticsQuery } from "@/store/services/customersService";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

const MonthlyCustomerStatistics = () => {
  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { data, fields } = {},
    isLoading,
    isFetching,
  } = useGetMonthlyCustomerStatisticsQuery({
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
          fields={{ fields, fieldsRequiresRefetch: false }}
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

export default MonthlyCustomerStatistics;
