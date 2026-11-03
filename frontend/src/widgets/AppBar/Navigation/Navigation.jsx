import { useState } from "react";
import { MdOutlineMenu, MdClose } from "react-icons/md";

import clsx from "clsx";
import logo from "@/assets/logo.png";
import s from "./Navigation.module.scss";
import NavItem from "@/shared/ui/NavItem";
import { publicRoutes } from "@/router";

const Navigation = ({ routes, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  return (
    <nav className={s.navContainer}>
      <NavItem to="/">
        <img src={logo} alt="Logo" />
      </NavItem>
      <ul className={clsx(s.nav, { [s.active]: isOpen })}>
        {routes.map(
          (route) =>
            !route?.hidden &&
            route?.type == "link" && (
              <li key={route.path} onClick={handleClose}>
                <NavItem to={route.path}>{route.navLabel}</NavItem>
              </li>
            )
        )}
      </ul>
      <div className={s.navIcons}>
        <div
          className={clsx(s.navIcons, s.HamburgerCrossIcons)}
          onClick={handleToggle}
        >
          {isOpen ? <MdClose size="25px" /> : <MdOutlineMenu size="25px" />}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
