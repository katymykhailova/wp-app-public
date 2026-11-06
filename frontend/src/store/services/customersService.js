import { baseApi } from "@/store/api/baseApi";
import serializeQueryParams from "@/store/api/utils/serializeQueryParams";

export const customersAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNewsletter: builder.query({
      query: (params) => ({
        url: "/app/customers/get-all-newsletter",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Customers"],
      keepUnusedDataFor: 300,
    }),
    getMonthlyCustomerStatistics: builder.query({
      query: (params) => ({
        url: "/app/customers/get-monthly-customer-statistics",
        params: serializeQueryParams(params),
      }),
      providesTags: ["Customers"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetAllNewsletterQuery,
  useGetMonthlyCustomerStatisticsQuery,
} = customersAPI;
