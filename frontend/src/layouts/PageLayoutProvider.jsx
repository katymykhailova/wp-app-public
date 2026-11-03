import { PageLayoutContext } from "@/context/PageLayoutContext";

export const PageLayoutProvider = ({ config, children }) => {
  return (
    <PageLayoutContext.Provider value={{ config }}>
      {children}
    </PageLayoutContext.Provider>
  );
};
