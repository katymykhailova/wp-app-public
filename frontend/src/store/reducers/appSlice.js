import { createSlice } from "@reduxjs/toolkit";

// error: {
//   status: 500,
//   message: "Ein Fehler ist aufgetreten.",
// };

const initialState = {
  forbidden: false,
  error: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setForbidden: (state, action) => {
      state.forbidden = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setForbidden, setError } = appSlice.actions;
export default appSlice.reducer;
