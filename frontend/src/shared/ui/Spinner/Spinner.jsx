import { RingLoader } from "react-spinners";

import s from "./Spinner.module.scss";

const Spinner = () => {
  return (
    <div className={s.overlay}>
      <RingLoader color="#f29400" />
    </div>
  );
};

export default Spinner;
