import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const Produkte = () => {
  const config = pagesConfig["/produkte"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Produkte" />
    </PageLayoutProvider>
  );
};

export default Produkte;
