import { isRejectedWithValue } from "@reduxjs/toolkit";

export const apiErrorMiddleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const status = action.payload?.status;

    if (status === 403) {
      //
    }
  }

  return next(action);
};
