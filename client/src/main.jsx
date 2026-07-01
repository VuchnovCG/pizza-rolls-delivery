import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { initTelegram } from './telegram.js'

initTelegram()

createRoot(document.getElementById('root')).render(<App />)
