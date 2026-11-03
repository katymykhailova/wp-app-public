import { baseApi } from "@/store/api/baseApi";
import serializeQueryParams from "@/store/api/utils/serializeQueryParams";

export const visitorsAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllVisitors: builder.query({
      query: (params) => ({
        url: "/app/visitors/get-all-visitors",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Visitors"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllVisitorsQuery } = visitorsAPI;
