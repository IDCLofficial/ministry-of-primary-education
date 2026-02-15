import { configureStore } from '@reduxjs/toolkit'
import { apiSlice as studentApiSlice } from './api/apiSlice'
import { apiSlice as portalApiSlice } from '@/app/portal/store/api/apiSlice'

export const store = configureStore({
  reducer: {
    [studentApiSlice.reducerPath]: studentApiSlice.reducer,
    [portalApiSlice.reducerPath]: portalApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(studentApiSlice.middleware)
      .concat(portalApiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
