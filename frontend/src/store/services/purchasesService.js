import { baseApi } from "@/store/api/baseApi";

export const purchasesAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFirstToSecondPurchaseIntervals: builder.query({
      query: (params) => ({
        url: "/app/purchases/get-first-to-second-purchase-intervals",
        params,
      }),
      providesTags: ["Purchases"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetFirstToSecondPurchaseIntervalsQuery } = purchasesAPI;
