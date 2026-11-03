import s from "./Actions.module.scss";

const Actions = ({ children }) => {
  return <div className={s.actions}>{children}</div>;
};

const ActionButton = ({ children, onClick, title }) => {
  return (
    <button type="button" className={s.button} onClick={onClick} title={title}>
      {children}
    </button>
  );
};

const ActionsItem = ({ children, title }) => {
  return (
    <div className={s.item} title={title}>
      {children}
    </div>
  );
};

Actions.Button = ActionButton;
Actions.Item = ActionsItem;

export default Actions;
