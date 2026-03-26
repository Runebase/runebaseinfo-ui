import { configureStore } from '@reduxjs/toolkit'
import { api } from './api'
import blockchainReducer from './blockchainSlice'
import addressReducer from './addressSlice'
import localeReducer from './localeSlice'
import themeReducer from './themeSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    blockchain: blockchainReducer,
    address: addressReducer,
    locale: localeReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})
