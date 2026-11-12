import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '../framer-extra/styles.css'
import '../framer/styles.css'
import './styles.css'

// Framer animations expect a single mount; intentionally omit StrictMode.
createRoot(document.getElementById('root')).render(<App />)
