import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";
import { apiErrorMiddleware } from "@/store/middleware/apiErrorMiddleware";
import appSlice from "@/store/reducers/appSlice";

export const setupStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      app: appSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, apiErrorMiddleware),
  });
};
