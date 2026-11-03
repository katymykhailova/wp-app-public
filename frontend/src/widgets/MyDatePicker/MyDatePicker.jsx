import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import s from "./MyDatePicker.module.scss";

const MyDatePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <>
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        dateFormat="dd.MM.yyyy"
        dayClassName={() => {
          return "myDatePickerDate";
        }}
        popperClassName={"myDatePickerPopper"}
        className={s.myDatePicker}
        calendarClassName={"myDatePickerCalendar"}
      />
      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        dateFormat="dd.MM.yyyy"
        dayClassName={() => {
          return "myDatePickerDate";
        }}
        popperClassName={"myDatePickerPopper"}
        className={s.myDatePicker}
        calendarClassName={"myDatePickerCalendar"}
      />
    </>
  );
};
export default MyDatePicker;
