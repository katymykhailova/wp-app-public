import { publicRoutes } from "@/router";
import NavItem from "@/shared/ui/NavItem";

import { MdOutlineLogout, MdOutlineLogin } from "react-icons/md";

import s from "./HeaderActions.module.scss";

const HeaderActions = ({ userData, onClick, onLogout, ref }) => {
  const authenticated = userData?.authenticated || false;
  const username = userData?.user?.username || "";
  const userInitials = username.slice(0, 2).toUpperCase();

  return (
    <>
      <div className={s.navIcons}>
        <ul className={s.navIconList}>
          {publicRoutes.map((route) => {
            const Icon = route.icon;
            return (
              !route?.hidden &&
              route?.type == "icon" && (
                <li key={route.path} className={s.navIconItem}>
                  <NavItem to={route.path}>
                    <Icon size="25px" />
                  </NavItem>
                </li>
              )
            );
          })}
          {!authenticated && (
            <li className={s.navIconItem}>
              <NavItem to={"/login"}>
                <MdOutlineLogin size="25px" />
              </NavItem>
            </li>
          )}
          {authenticated && (
            <li className={s.navIconItem} onClick={onLogout}>
              <a className={s.navIconLink}>
                <MdOutlineLogout size="25px" />
              </a>
            </li>
          )}
          {authenticated && (
            <div className={s.navIconItem} onClick={onClick} ref={ref}>
              <div className={s.userLable}>{userInitials}</div>
            </div>
          )}
        </ul>
      </div>
    </>
  );
};

export default HeaderActions;
