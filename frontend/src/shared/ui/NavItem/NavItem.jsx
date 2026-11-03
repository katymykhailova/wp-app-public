import { NavLink } from "react-router-dom";
import clsx from "clsx";
import s from "./NavItem.module.scss";

const NavItem = ({ to, children, exact }) => {
  return (
    <NavLink
      className={({ isActive }) => clsx(s.navLink, { [s.active]: isActive })}
      to={to}
      end={exact}
    >
      {children}
    </NavLink>
  );
};

export default NavItem;
