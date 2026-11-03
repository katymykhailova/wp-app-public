import "./styles/App.scss";
import AppRouter from "./layouts/AppRouter";
import { useMeQuery } from "@/store/services";

function App() {
  const { data: userData, isLoading } = useMeQuery();
  if (isLoading) return null;
  return (
    <>
      <AppRouter authenticated={userData?.authenticated} />
    </>
  );
}

export default App;
