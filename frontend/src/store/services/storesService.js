import { baseApi } from "@/store/api/baseApi";

export const storeslAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllStores: builder.query({
      query: (params) => ({
        url: "/stores",
        params,
      }),
      providesTags: ["Stores"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllStoresQuery } = storeslAPI;
