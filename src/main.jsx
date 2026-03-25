import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { store } from './store'
import { WebSocketProvider } from './hooks/useWebSocket'
import './i18n'

import 'bulma/css/bulma.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './styles/common.css'
import './styles/card.css'
import './styles/info-table.css'
import './styles/links.css'
import './icons/style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <WebSocketProvider>
        <App />
      </WebSocketProvider>
    </BrowserRouter>
  </Provider>
)
