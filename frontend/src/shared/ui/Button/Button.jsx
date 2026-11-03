import s from "./Button.module.scss";
const Button = ({ onClick, children }) => {
  return (
    <button onClick={onClick} className={s.button}>
      {children}
    </button>
  );
};
export default Button;
