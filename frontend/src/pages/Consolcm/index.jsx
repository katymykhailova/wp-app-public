import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const Consolcm = () => {
  const config = pagesConfig["/consolcm"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Consolcm" />
    </PageLayoutProvider>
  );
};

export default Consolcm;
