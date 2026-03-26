import React, { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { store } from './store'
import { WebSocketProvider } from './hooks/useWebSocket'
import { SnackbarProvider } from './hooks/useSnackbar'
import ErrorBoundary from './components/ErrorBoundary'
import { createAppTheme } from './theme'
import './i18n'

import './fonts.css'
import './icons/style.css'

function ThemedApp() {
  const mode = useSelector(state => state.theme.mode)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>
        <BrowserRouter>
          <WebSocketProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </WebSocketProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemedApp />
  </Provider>
)
