const isInvalidObject = (obj, allowEmpty = false) => {
  if (
    !obj ||
    typeof obj !== "object" ||
    Array.isArray(obj) ||
    (Object.keys(obj).length === 0 && !allowEmpty)
  ) {
    return true;
  }
  return false;
};

const isInvalidArray = (arr, allowEmpty = false) => {
  if (!arr || !Array.isArray(arr) || (!allowEmpty && arr.length === 0)) {
    return true;
  }
  return false;
};

export { isInvalidObject, isInvalidArray };
