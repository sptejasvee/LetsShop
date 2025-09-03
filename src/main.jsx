import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { ShopContextProvider } from './context/ShopContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
