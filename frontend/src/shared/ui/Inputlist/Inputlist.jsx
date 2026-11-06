import clsx from "clsx";
import s from "./Inputlist.module.scss";

const Inputlist = ({ checkList, type = "checkbox", name, handleChange }) => {
  return (
    <>
      <ul className={s.inputGroup}>
        {checkList.map((checkItem) => (
          <li
            className={clsx(s.inputItem, {
              [s.radioItem]: type === "radio",
            })}
            key={checkItem.label}
          >
            <label className={s.category}>
              <input
                type={type}
                label={checkItem.label}
                checked={Boolean(checkItem.checked)}
                onChange={() => handleChange(checkItem.key)}
                value={checkItem.key}
                name={name}
                className={clsx(s.inputItem, {
                  [s.checkboxItem]: type === "checkbox",
                })}
              />
              <span>{checkItem.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Inputlist;
