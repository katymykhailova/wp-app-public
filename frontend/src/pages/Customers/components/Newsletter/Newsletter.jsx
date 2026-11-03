import { useState } from "react";
import { format } from "date-fns";

import { useGetAllNewsletterQuery } from "@/store/services/customersService";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

const Newsletter = () => {
  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { data, fields, filters } = {},
    isLoading,
    isFetching,
  } = useGetAllNewsletterQuery({
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
          filters={filters}
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

export default Newsletter;
