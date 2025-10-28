import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  // Add UI state properties as needed
  placeholder?: string
}

const initialState: UiState = {
  // Initialize state here
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Add reducers as needed
  },
})

export const {} = uiSlice.actions

export default uiSlice.reducer
