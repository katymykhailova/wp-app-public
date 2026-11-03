import { baseApi } from "@/store/api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    me: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;

        dispatch(
          authApi.util.upsertQueryData("me", undefined, {
            authenticated: false,
            user: null,
          }),
        );
      },
    }),
  }),
});

export const { useLoginMutation, useMeQuery, useLogoutMutation } = authApi;
