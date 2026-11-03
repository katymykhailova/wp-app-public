import s from "./Dropdown.module.scss";
import React from "react";
import clsx from "clsx";

const Dropdown = ({
  placeholder = "",
  isOpen = false,
  onToggle,
  children,
  dropdownRef,
  buttonRef,
  width = "400px",
}) => {
  return (
    <div className={s.container}>
      <div
        className={s.dropdownContainer}
        style={{ "--dropdown-width": width }}
      >
        <h4 className={s.dropdownCurrent} onClick={onToggle} ref={buttonRef}>
          {placeholder}
          <span className={clsx({ [s.active]: isOpen })}>&#9650;</span>
          <span className={clsx({ [s.active]: !isOpen })}>&#9660;</span>
        </h4>
        <div
          className={clsx(s.dropdownListContainer, { [s.active]: isOpen })}
          ref={dropdownRef}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const DropdownList = ({ items, field, keyField, onClick }) => {
  return (
    <ul className={s.dropdownList}>
      {items.map((item) => (
        <li
          key={item[keyField]}
          onClick={() => onClick(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onClick(item)}
          className={s.dropdownItem}
        >
          {item[field]}
        </li>
      ))}
    </ul>
  );
};

Dropdown.List = DropdownList;

export default Dropdown;
