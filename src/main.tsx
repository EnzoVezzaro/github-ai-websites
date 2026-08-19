import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './context/SettingsContext'
import { PluginProvider } from './plugins'
import { CollaborationProvider } from './context/CollaborationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <PluginProvider>
        <CollaborationProvider>
          <App />
        </CollaborationProvider>
      </PluginProvider>
    </SettingsProvider>
  </StrictMode>,
)
