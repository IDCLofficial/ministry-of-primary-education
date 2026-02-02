import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_URL,
    }),
    endpoints: (builder) => ({
        login: builder.mutation<{ token: string; user: any }, { email: string; password: string }>({
          query: (credentials) => ({
            url: '/auth/login',
            method: 'POST',
            body: credentials,
          }),
        }),
    })
})

export const { useLoginMutation } = authApi;
