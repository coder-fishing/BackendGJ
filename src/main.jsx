import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.scss'
import Modal from 'react-modal';

// Set the app element for react-modal
Modal.setAppElement(document.getElementById('root'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
