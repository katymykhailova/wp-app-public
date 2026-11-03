import { baseApi } from "@/store/api/baseApi";

export const personalAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPersonal: builder.query({
      query: (params) => ({
        url: "/personal",
        params,
      }),
      providesTags: ["Personal"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllPersonalQuery } = personalAPI;
