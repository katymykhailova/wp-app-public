import { baseApi } from "@/store/api/baseApi";
import { v4 as uuidv4 } from "uuid";

export const newsAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNews: builder.query({
      query: (params) => ({
        url: "/news",
        params,
      }),
      transformResponse: (response) =>
        response.map((item) => ({
          ...item,
          id: uuidv4(),
        })),
      providesTags: ["News"],
    }),
  }),
});

export const { useGetAllNewsQuery } = newsAPI;
