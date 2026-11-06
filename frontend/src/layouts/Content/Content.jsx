import { useSelector } from "react-redux";

import clsx from "clsx";

import s from "./Content.module.scss";
import { usePageLayout } from "@/context/PageLayoutContext";

import ForbiddenPage from "@/layouts/Content/ForbiddenPage/ForbiddenPage";

const Content = ({ children }) => {
  const forbidden = useSelector((state) => state.app.forbidden);

  const { config } = usePageLayout();
  const {
    title = "",
    subTitle = "",
    backgroundImage,
    hasBanner = true,
    hasSigebar = false,
  } = config;

  const isSubTitle = (str) => str.length > 7;

  return (
    <main
      className={clsx(s.contentWrapper, {
        [s.withSidebar]: hasSigebar,
        [s.noSidebar]: !hasSigebar,
      })}
      style={
        backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}
      }
    >
      {hasBanner && (
        <div className={s.contentBanner}>
          <h1 className={s.contentTitle}>
            {title}
            <span className={s.contenSubtTitle}>
              {!isSubTitle(subTitle) && subTitle}
            </span>
          </h1>
          {isSubTitle(subTitle) && (
            <h2 className={s.contenSubtTitle}>{subTitle}</h2>
          )}
        </div>
      )}
      {forbidden ? <ForbiddenPage /> : children}
    </main>
  );
};

export default Content;
