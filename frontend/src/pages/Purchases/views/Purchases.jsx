import { useParams } from "react-router-dom";

import Content from "@/layouts/Content";

import FirstToSecondPurchaseIntervals from "../components/FirstToSecondPurchaseIntervals/FirstToSecondPurchaseIntervals";

const Purchases = () => {
  const { reportType } = useParams();

  return (
    <Content>
      {reportType === "first-to-second-purchase-intervals" && (
        <FirstToSecondPurchaseIntervals />
      )}
    </Content>
  );
};

export default Purchases;
