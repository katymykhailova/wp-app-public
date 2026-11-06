import { baseApi } from "@/store/api/baseApi";

export const suppliersAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSuppliers: builder.query({
      query: (params) => ({
        url: "/suppliers",
        params,
      }),
      providesTags: ["Suppliers"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllSuppliersQuery } = suppliersAPI;
