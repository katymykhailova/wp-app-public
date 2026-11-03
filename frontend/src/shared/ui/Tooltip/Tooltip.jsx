import s from "./Tooltip.module.scss";

const Tooltip = ({ ref, children }) => {
  return (
    <div ref={ref} className={s.tooltip}>
      {children}
    </div>
  );
};

export default Tooltip;
