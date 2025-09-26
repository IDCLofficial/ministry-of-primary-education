import { createSlice } from '@reduxjs/toolkit'

interface FiltersState {
  // Add filter state properties as needed
  placeholder?: string
}

const initialState: FiltersState = {
  // Initialize state here
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Add reducers as needed
  },
})

export const {} = filtersSlice.actions

export default filtersSlice.reducer