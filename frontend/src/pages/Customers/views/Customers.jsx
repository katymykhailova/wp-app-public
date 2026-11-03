import { useParams } from "react-router-dom";

import Content from "@/layouts/Content";

import Newsletter from "../components/Newsletter/Newsletter";
import MonthlyCustomerStatistics from "../components/MonthlyCustomerStatistics/MonthlyCustomerStatistics";

const Customers = () => {
  const { reportType } = useParams();

  return (
    <Content>
      {reportType === "newsletter" && <Newsletter />}
      {reportType === "monthly-customer-statistics" && (
        <MonthlyCustomerStatistics />
      )}
    </Content>
  );
};

export default Customers;
