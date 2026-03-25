import { createSlice } from '@reduxjs/toolkit'

const blockchainSlice = createSlice({
  name: 'blockchain',
  initialState: { height: 0 },
  reducers: {
    setHeight(state, action) {
      state.height = action.payload
    }
  }
})

export const { setHeight } = blockchainSlice.actions
export default blockchainSlice.reducer
