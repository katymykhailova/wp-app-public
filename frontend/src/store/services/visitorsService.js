import { baseApi } from "@/store/api/baseApi";

export const visitorsAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVisitors: builder.query({
      query: (params) => ({
        url: "/app/visitors/get-all-visitors",
        params,
      }),
      providesTags: ["Visitors"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllVisitorsQuery } = visitorsAPI;
