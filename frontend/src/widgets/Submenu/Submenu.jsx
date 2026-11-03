import { MdMenuOpen, MdClose } from "react-icons/md";
import clsx from "clsx";
import { useState } from "react";

import { publicRoutes, privateRoutes } from "@/router";
import NavItem from "@/shared/ui/NavItem";
import s from "./Submenu.module.scss";

const Submenu = ({ component }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRoute =
    publicRoutes.find((route) => route.component === component) ||
    privateRoutes.find((route) => route.component === component) ||
    [];

  const {
    nested = [],
    nested2 = [],
    navLabel: sidebarTitle,
    navLabel2: sidebarTitle2,
  } = sidebarRoute || {};

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const renderSection = (title, routes, hasTitle = false) =>
    routes.length > 0 && (
      <>
        {hasTitle && title && <div className={s.sidebarTitle}>{title}</div>}
        <ul className={s.sidebarNav}>
          {routes.map((route) => (
            <li
              className={s.sidebarItem}
              key={route.path}
              onClick={handleClose}
            >
              <NavItem to={route.path}>{route.navLabel}</NavItem>
            </li>
          ))}
        </ul>
      </>
    );

  return (
    <>
      <aside className={s.sidebar}>
        <div className={s.sidebarIcons} onClick={handleToggle}>
          <div className={s.sidebarIcon}>
            {isOpen ? <MdClose size="25px" /> : <MdMenuOpen size="25px" />}
          </div>
        </div>
        <nav className={clsx(s.sidebarContainer, { [s.active]: isOpen })}>
          {renderSection(sidebarTitle, nested, sidebarTitle && sidebarTitle2)}
          {renderSection(sidebarTitle2, nested2, sidebarTitle && sidebarTitle2)}
        </nav>
      </aside>
    </>
  );
};

export default Submenu;
