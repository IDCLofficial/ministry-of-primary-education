import { createSlice } from '@reduxjs/toolkit'

interface StudentsState {
  // Add student state properties as needed
  placeholder?: string
}

const initialState: StudentsState = {
  // Initialize state here
}

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    // Add reducers as needed
  },
})

export const {} = studentsSlice.actions

export default studentsSlice.reducer
