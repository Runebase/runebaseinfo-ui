import { createSlice } from '@reduxjs/toolkit'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme-mode') : null

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved || 'light' },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', state.mode)
    },
    setThemeMode(state, action) {
      state.mode = action.payload
      localStorage.setItem('theme-mode', state.mode)
    },
  },
})

export const { toggleTheme, setThemeMode } = themeSlice.actions
export default themeSlice.reducer
