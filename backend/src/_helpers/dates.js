const getCurrentDayMonthYear = () => {
  const dateNow = new Date();
  const day = dateNow.getDate();
  const month = dateNow.getMonth() + 1;
  const year = dateNow.getFullYear();
  return `${year}${month}${day > 9 ? day : "0" + day}`;
};

const getDayMonthYear = (date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}${month}${day > 9 ? day : "0" + day}`;
};

export { getCurrentDayMonthYear, getDayMonthYear };
