import { baseApi } from "@/store/api/baseApi";

export const customersAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNewsletter: builder.query({
      query: (params) => ({
        url: "/app/customers/get-all-newsletter",
        params,
      }),
      providesTags: ["Customers"],
      keepUnusedDataFor: 300,
    }),
    getMonthlyCustomerStatistics: builder.query({
      query: (params) => ({
        url: "/app/customers/get-monthly-customer-statistics",
        params,
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
