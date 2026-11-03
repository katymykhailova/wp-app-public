import { baseApi } from "@/store/api/baseApi";

export const branchesAPI = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBranches: builder.query({
      query: (params) => ({
        url: "/branches",
        params,
      }),
      providesTags: ["Branches"],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetAllBranchesQuery } = branchesAPI;
