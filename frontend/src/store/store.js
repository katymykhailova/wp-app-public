import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "@/store/api/baseApi";

// import { fileSlice } from "@/store/reducers/_fileSystem.slice";
// import uiReducer from "./features/ui/uiSlice";
// import filtersReducer from "./features/filters/filtersSlice";

export const setupStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      // [fileSlice.name]: fileSlice.reducer,
      // filters: filtersReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
};
