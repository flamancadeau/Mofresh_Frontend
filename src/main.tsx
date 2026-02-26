import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'sonner';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)