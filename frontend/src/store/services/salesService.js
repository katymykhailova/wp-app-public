import { baseApi } from "@/store/api/baseApi";
import serializeQueryParams from "@/store/api/utils/serializeQueryParams";

export const salesAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesByChannel: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-channel",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesByBranch: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-branch",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesQuotations: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-quotations",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesByPostcode: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-by-postcode",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Sales"],
      keepUnusedDataFor: 300,
    }),
    getSalesDetails: builder.query({
      query: (params) => ({
        url: "/app/sales/get-sales-details",
        params: serializeQueryParams(params),
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
  useGetSalesDetailsQuery,
} = salesAPI;
