import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const PurchasesPage = () => {
  const config = pagesConfig["/purchases"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Purchases" />
    </PageLayoutProvider>
  );
};

export default PurchasesPage;
