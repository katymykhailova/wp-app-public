import { useState } from "react";

import { format } from "date-fns";

import { useGetAllVisitorsQuery } from "@/store/services";

import Content from "@/layouts/Content";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import MyDatePicker from "@/widgets/MyDatePicker";
import Report from "@/widgets/Report";
import Spinner from "@/shared/ui/Spinner";

import { pagesConfig } from "@/shared/config/pages.config";

const Visitors = () => {
  const config = pagesConfig["/visitors"];

  const currentDay = new Date();
  const startOfYear = new Date(currentDay.getFullYear(), 0, 1);

  const [startDate, setStartDate] = useState(startOfYear);
  const [endDate, setEndDate] = useState(currentDay);
  const [queryParams, setQueryParams] = useState({});

  const {
    data: { fields, data, filters, timeGranularity, totals, chartConfig } = {},
    isLoading,
    isFetching,
  } = useGetAllVisitorsQuery({
    dateStart: format(startDate, "yyyyMMdd"),
    dateEnd: format(endDate, "yyyyMMdd"),
    ...queryParams,
  });

  return (
    <PageLayoutProvider config={config}>
      <Content>
        {(isLoading || isFetching) && <Spinner />}
        {data && (
          <Report
            data={data}
            fields={fields}
            filters={filters}
            timeGranularity={timeGranularity}
            totals={totals}
            chartConfig={chartConfig}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onParamsChange={setQueryParams}
          />
        )}
      </Content>
    </PageLayoutProvider>
  );
};

export default Visitors;
