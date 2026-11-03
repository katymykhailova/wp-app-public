import clsx from "clsx";

import NavItem from "@/shared/ui/NavItem";

import s from "./WorkspaceMenu.module.scss";

const WorkspaceMenu = ({ routes, isOpen, onClick, ref }) => {
  return (
    <>
      {
        <div
          ref={ref}
          className={clsx(s.wsMenuContainer, { [s.active]: isOpen })}
        >
          <ul className={clsx(s.menuList)}>
            {routes.map(
              (route) =>
                !route?.hidden &&
                route?.type == "link" && (
                  <li key={route.path} onClick={onClick}>
                    <NavItem to={route.path}>{route.navLabel}</NavItem>
                  </li>
                ),
            )}
          </ul>
        </div>
      }
    </>
  );
};

export default WorkspaceMenu;
