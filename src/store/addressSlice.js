import { createSlice } from '@reduxjs/toolkit'

const saved = (typeof localStorage !== 'undefined' && localStorage.getItem('my-addresses') || '').split(',').filter(Boolean)

const addressSlice = createSlice({
  name: 'address',
  initialState: { myAddresses: saved },
  reducers: {
    addAddress(state, action) {
      let addresses = Array.isArray(action.payload) ? action.payload : [action.payload]
      for (let address of addresses) {
        if (!state.myAddresses.includes(address)) {
          state.myAddresses.push(address)
        }
      }
      state.myAddresses.sort()
      localStorage.setItem('my-addresses', state.myAddresses.join(','))
    },
    removeAddress(state, action) {
      let addresses = Array.isArray(action.payload) ? action.payload : [action.payload]
      for (let address of addresses) {
        let index = state.myAddresses.indexOf(address)
        if (index >= 0) {
          state.myAddresses.splice(index, 1)
        }
      }
      localStorage.setItem('my-addresses', state.myAddresses.join(','))
    },
    clearAddresses(state) {
      state.myAddresses = []
      localStorage.removeItem('my-addresses')
    }
  }
})

export const { addAddress, removeAddress, clearAddresses } = addressSlice.actions
export default addressSlice.reducer
