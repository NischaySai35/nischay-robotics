import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Self-hosted variable fonts — no external font CDN, so no third-party request
// blocking first paint and no layout shift when the webfont lands.
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import 'lenis/dist/lenis.css'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
