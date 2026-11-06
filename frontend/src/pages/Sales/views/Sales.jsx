import { useParams } from "react-router-dom";

import Content from "@/layouts/Content";

import SalesByChannel from "../components/SalesByChannel/SalesByChannel";
import SalesByBranch from "../components/SalesByBranch/SalesByBranch";
import SalesQuotations from "../components/SalesQuotations/SalesQuotations";
import SalesByPostcode from "../components/SalesByPostcode/SalesByPostcode";
import SalesDetails from "../components/SalesDetails/SalesDetails";

const Sales = () => {
  const { reportType } = useParams();

  return (
    <Content>
      {!reportType && <SalesByPostcode />}
      {reportType === "sales-by-channel" && <SalesByChannel />}
      {reportType === "sales-by-branch" && <SalesByBranch />}
      {reportType === "sales-quotations" && <SalesQuotations />}
      {reportType === "sales-by-postcode" && <SalesByPostcode />}
      {reportType === "sales-details" && <SalesDetails />}
    </Content>
  );
};

export default Sales;
