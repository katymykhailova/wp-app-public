import { useContext, createContext } from "react";

export const PageLayoutContext = createContext({
  config: {},
});

export const usePageLayout = () => useContext(PageLayoutContext);
