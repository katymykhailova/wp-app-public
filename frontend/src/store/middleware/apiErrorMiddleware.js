import { isRejectedWithValue } from "@reduxjs/toolkit";
import { setForbidden } from "../reducers/appSlice";

export const apiErrorMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action)) {
      const payload = action.payload;

      if (
        payload?.status === 403 &&
        payload?.data?.code === "INSUFFICIENT_PERMISSIONS"
      ) {
        dispatch(setForbidden(true));
      }
    }

    return next(action);
  };
