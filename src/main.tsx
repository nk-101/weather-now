// Enables additional checks and warnings for potential React issues during development
import { StrictMode } from 'react'

// Creates a React root for rendering into the DOM
import { createRoot } from 'react-dom/client'

// Imports global CSS (Tailwind setup + custom styles)
import './index.css'

// Main application component
import App from './App.tsx'

// Mounts the React app into the <div id="root"> in index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
