import s from "./Inputlist.module.scss";

const Inputlist = ({ checkList, handleChange }) => {
  return (
    <>
      <div className={s.inputTumb}>
        {checkList.map((checkItem) => (
          <label className={s.category} key={checkItem.label}>
            <input
              type="checkbox"
              label={checkItem.label}
              checked={checkItem.checked}
              onChange={() => handleChange(checkItem.key)}
            />
            <span>{checkItem.label}</span>
          </label>
        ))}
      </div>
    </>
  );
};

export default Inputlist;
