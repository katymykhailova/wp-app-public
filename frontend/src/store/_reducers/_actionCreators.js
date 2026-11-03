import { api } from "@/shared/api";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAllFiles = createAsyncThunk(
  "fileSystem/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/fileSystem");
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);

export const downloadFiles = createAsyncThunk(
  "fileSystem/download",
  async (files, thunkAPI) => {
    try {
      const response = await api.get("/fileSystem/download", { files });
      return response.data;
    } catch (e) {
      return thunkAPI.rejectWithValue(e);
    }
  },
);
