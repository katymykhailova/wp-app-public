import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const Customers = () => {
  const config = pagesConfig["/customers"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Customers" />
    </PageLayoutProvider>
  );
};

export default Customers;
