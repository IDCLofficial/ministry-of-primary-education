import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiSlice } from './api/apiSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Feature slices
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [apiSlice.util.resetApiState.type],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Setup RTK Query listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
