import { createContext, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings, loadMeta, type Settings } from '../lib/settings';

const SettingsCtx = createContext<{ settings: Settings; update: (p: Partial<Settings>) => void } | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  useEffect(() => {
    const m = loadMeta();
    if (m) setSettings(s => ({ ...s, ...m }));
  }, []);

  const update = (patch: Partial<Settings>) => {
    saveSettings(patch);
    setSettings(s => ({ ...s, ...patch }));
  };

  return <SettingsCtx.Provider value={{ settings, update }}>{children}</SettingsCtx.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
