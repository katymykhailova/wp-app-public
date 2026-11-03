import { useEffect } from "react";
import { fetchAllFiles } from "@/store/_reducers/_actionCreators";
import { useSelector, useDispatch } from "react-redux";

const Component = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.fileSystem.files);
  useEffect(() => {
    dispatch(fetchAllFiles());
  }, [dispatch]);

  return (
    <div>
      <h1>Produkte</h1>
      {data && data.map((file) => <div>{file}</div>)}
    </div>
  );
};

export default Component;
