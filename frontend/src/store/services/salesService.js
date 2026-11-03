import { baseApi } from "@/store/api/baseApi";

export const salesAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesByChannel: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-channel",
        params,
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesByBranch: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-branch",
        params,
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesQuotations: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-quotations",
        params,
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesByPostcode: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-postcode",
        params,
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetSalesByChannelQuery,
  useGetSalesByBranchQuery,
  useGetSalesQuotationsQuery,
  useGetSalesByPostcodeQuery,
} = salesAPI;
