import { createSlice } from '@reduxjs/toolkit'

const localeSlice = createSlice({
  name: 'locale',
  initialState: { language: 'en' },
  reducers: {
    setLanguage(state, action) {
      state.language = action.payload
    }
  }
})

export const { setLanguage } = localeSlice.actions
export default localeSlice.reducer
