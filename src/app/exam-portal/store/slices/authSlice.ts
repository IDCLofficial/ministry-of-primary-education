import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Admin {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
  isActive: boolean
}

interface AuthState {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'beceAuth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ admin: Admin; token: string }>) => {
      state.admin = action.payload.admin
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    clearCredentials: (state) => {
      state.admin = null
      state.token = null
      state.isAuthenticated = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    updateAdmin: (state, action: PayloadAction<Partial<Admin>>) => {
      if (state.admin) {
        state.admin = { ...state.admin, ...action.payload }
      }
    },
  },
})

export const { setCredentials, clearCredentials, setLoading, updateAdmin } = authSlice.actions
export default authSlice.reducer
