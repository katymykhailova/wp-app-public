import { createSlice } from "@reduxjs/toolkit";
import { fetchAllFiles, downloadFiles } from "./_actionCreators";

const initialState = {
  files: [],
  isLoading: false,
  error: "",
};

export const fileSlice = createSlice({
  name: "fileSystem",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // fetchAll
      .addCase(fetchAllFiles.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload;
      })
      .addCase(fetchAllFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // download
      .addCase(downloadFiles.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(downloadFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entities.push(action.payload);
      })
      .addCase(downloadFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
