import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_URL) throw "no api url";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
  }),
  tagTypes: [
    "FileSystem",
    "News",
    "Personal",
    "stores",
    "Suppliers",
    "User",
    "Branches",
    "Sales",
    "Purchases",
    "Customers",
  ],
  endpoints: () => ({}),
});
