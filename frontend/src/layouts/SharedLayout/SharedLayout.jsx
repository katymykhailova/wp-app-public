import { Outlet } from "react-router-dom";
import s from "./SharedLayout.module.scss";
import AppBar from "@/widgets/AppBar";
import Footer from "@/widgets/Footer";

const SharedLayout = () => {
  return (
    <div className={s.container}>
      <AppBar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default SharedLayout;
