import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pluginRegistry } from './registry';
import type { Plugin } from './types';

interface PluginContextValue {
  /** All registered plugins */
  plugins: Plugin[];
  /** Check if a plugin is enabled */
  isEnabled: (id: string) => boolean;
  /** Toggle a plugin on/off */
  toggle: (id: string) => void;
  /** Enable a plugin */
  enable: (id: string) => void;
  /** Disable a plugin */
  disable: (id: string) => void;
  /** Force re-render when plugin state changes */
  version: number;
}

const PluginCtx = createContext<PluginContextValue | null>(null);

export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);

  const forceUpdate = useCallback(() => setVersion(v => v + 1), []);

  // Initialize enabled plugins on mount
  useEffect(() => {
    pluginRegistry.initAll();
    return () => pluginRegistry.destroyAll();
  }, []);

  const toggle = useCallback((id: string) => {
    pluginRegistry.toggle(id);
    forceUpdate();
  }, [forceUpdate]);

  const enable = useCallback((id: string) => {
    pluginRegistry.enable(id);
    forceUpdate();
  }, [forceUpdate]);

  const disable = useCallback((id: string) => {
    pluginRegistry.disable(id);
    forceUpdate();
  }, [forceUpdate]);

  const isEnabled = useCallback((id: string) => {
    return pluginRegistry.isEnabled(id);
  }, [version]); // Re-check when version changes

  return (
    <PluginCtx.Provider value={{
      plugins: pluginRegistry.getAll(),
      isEnabled,
      toggle,
      enable,
      disable,
      version,
    }}>
      {children}
    </PluginCtx.Provider>
  );
}

export function usePlugins() {
  const ctx = useContext(PluginCtx);
  if (!ctx) throw new Error('usePlugins must be used within PluginProvider');
  return ctx;
}

/** Hook to check if a specific plugin is enabled */
export function usePluginEnabled(id: string): boolean {
  const { isEnabled } = usePlugins();
  return isEnabled(id);
}
