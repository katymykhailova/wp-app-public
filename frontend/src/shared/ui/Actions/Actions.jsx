import clsx from "clsx";

import s from "./Actions.module.scss";

const Actions = ({ column, children }) => {
  return (
    <div className={clsx(s.actions, { [s.actionsColumn]: column })}>
      {children}
    </div>
  );
};

const ActionCollapsible = ({
  placeholder = "",
  onToggle,
  isOpen,
  children,
}) => {
  return (
    <>
      <button
        type="button"
        className={clsx(s.actionCollapsiblButton)}
        onClick={onToggle}
        title={placeholder}
      >
        <div>{placeholder}</div>
        <span
          className={clsx(s.actionCollapsiblButtonToggle, {
            [s.active]: isOpen,
          })}
        >
          &#9650;
        </span>
        <span
          className={clsx(s.actionCollapsiblButtonToggle, {
            [s.active]: !isOpen,
          })}
        >
          &#9660;
        </span>
      </button>

      <div className={clsx(s.actionCollapsiblePanel, { [s.active]: isOpen })}>
        {children}
      </div>
    </>
  );
};

const ActionButton = ({
  children,
  onClick,
  title,
  outlined,
  withText,
  buttonRef,
}) => {
  return (
    <button
      type="button"
      className={clsx(
        s.actionButton,
        { [s.withText]: withText },
        { [s.outlined]: outlined },
      )}
      onClick={onClick}
      title={title}
      ref={buttonRef}
    >
      {children}
    </button>
  );
};

const ActionItem = ({ children, title }) => {
  return (
    <div className={s.item} title={title}>
      {children}
    </div>
  );
};

Actions.Button = ActionButton;
Actions.Item = ActionItem;
Actions.Collapsible = ActionCollapsible;

export default Actions;
