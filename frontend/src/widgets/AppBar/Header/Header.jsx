import { useMeQuery, useLogoutMutation } from "@/store/services";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { publicRoutes, privateRoutes } from "@/router";
import { useClickOutside } from "@/shared/hooks";
import Navigation from "@/widgets/AppBar/Navigation";

import s from "./Header.module.scss";
import HeaderActions from "../HeaderActions/HeaderActions";
import WorkspaceMenu from "../WorkspaceMenu";

const Header = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const { data: userData } = useMeQuery();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useClickOutside([menuRef, buttonRef], isMenuOpen, handleClose);

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);
  const handleLogout = async () => {
    try {
      await logout().unwrap();

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const routesNavigation = userData?.authenticated
    ? privateRoutes
    : publicRoutes;
  const routesWorkspaceMenu = userData?.authenticated
    ? publicRoutes
    : privateRoutes;

  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <Navigation routes={routesNavigation} />
        <HeaderActions
          userData={userData}
          ref={buttonRef}
          onClick={handleMenuToggle}
          onLogout={handleLogout}
        />
      </div>
      <WorkspaceMenu
        routes={routesWorkspaceMenu}
        isOpen={isMenuOpen}
        onClick={handleMenuToggle}
        ref={menuRef}
      />
    </header>
  );
};

export default Header;
