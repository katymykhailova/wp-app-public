import { Outlet } from "react-router-dom";
import Submenu from "@/widgets/Submenu";
import { PageLayoutProvider } from "@/layouts/PageLayoutProvider";
import { pagesConfig } from "@/shared/config/pages.config";

const Abteilungen = () => {
  const config = pagesConfig["/abteilungen"];

  return (
    <PageLayoutProvider config={config}>
      <Outlet />
      <Submenu component="Abteilungen" />
    </PageLayoutProvider>
  );
};

export default Abteilungen;
