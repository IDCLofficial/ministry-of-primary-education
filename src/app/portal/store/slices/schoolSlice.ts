import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SchoolByCodeResponse } from '../api/authApi'

interface SchoolState {
  selectedSchool: SchoolByCodeResponse | null
  schoolCode: string | null
}

const initialState: SchoolState = {
  selectedSchool: null,
  schoolCode: null,
}

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setSelectedSchool: (state, action: PayloadAction<{ school: SchoolByCodeResponse; schoolCode: string }>) => {
      state.selectedSchool = action.payload.school
      state.schoolCode = action.payload.schoolCode
    },
    clearSelectedSchool: (state) => {
      state.selectedSchool = null
      state.schoolCode = null
    },
  },
})

export const { setSelectedSchool, clearSelectedSchool } = schoolSlice.actions
export default schoolSlice.reducer
