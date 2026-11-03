import { useState } from "react";
import { format } from "date-fns";

import { useGetFirstToSecondPurchaseIntervalsQuery } from "@/store/services";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

const FirstToSecondPurchaseIntervals = () => {
  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { fields, data } = {},
    isLoading,
    isFetching,
  } = useGetFirstToSecondPurchaseIntervalsQuery({
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

export default FirstToSecondPurchaseIntervals;
