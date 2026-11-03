import { MdManageSearch } from "react-icons/md";
import s from "./SearchForm.module.scss";

const SearchForm = ({ value, placeholder, onChange }) => {
  return (
    <form className={s.searchForm}>
      <div>
        <div className={s.searchLabel}>
          <MdManageSearch size="36px" />
        </div>

        <input
          type="search"
          name="search"
          id="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={s.searchInput}
        ></input>
      </div>
    </form>
  );
};

export default SearchForm;
