import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyTheme, type ThemeChoice } from './lib/theme'
import { readJSON } from './lib/storage'
import { account } from './lib/accounts'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/prose.css'
import './styles/pages.css'

applyTheme(readJSON<ThemeChoice>('theme', 'system'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Restores sign-in when accounts are on (does nothing otherwise). The account backend loads in the background.
account.init()
