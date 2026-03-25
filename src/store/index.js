import { configureStore } from '@reduxjs/toolkit'
import blockchainReducer from './blockchainSlice'
import addressReducer from './addressSlice'
import localeReducer from './localeSlice'

export const store = configureStore({
  reducer: {
    blockchain: blockchainReducer,
    address: addressReducer,
    locale: localeReducer
  }
})
