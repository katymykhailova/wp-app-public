import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const SalesPage = () => {
  const config = pagesConfig["/sales"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Sales" />
    </PageLayoutProvider>
  );
};

export default SalesPage;
