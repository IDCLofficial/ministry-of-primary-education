import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiSlice } from './api/apiSlice'
import studentsReducer from './slices/studentsSlice'
import filtersReducer from './slices/filtersSlice'
import uiReducer from './slices/uiSlice'
import authReducer from './slices/authSlice'
import schoolReducer from './slices/schoolSlice'

export const store = configureStore({
  reducer: {
    // RTK Query API slice
    [apiSlice.reducerPath]: apiSlice.reducer,
    
    // Feature slices
    students: studentsReducer,
    filters: filtersReducer,
    ui: uiReducer,
    auth: authReducer,
    school: schoolReducer,
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
