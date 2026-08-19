import { createContext, useContext } from 'react';
import type { StudioSnapshot } from './types';

/**
 * React context backing {@link useStudio}. `Studio` provides a snapshot of
 * shared state so every view (and any plugin that needs it) can consume the
 * workspace without prop-drilling through the view router.
 */
export const StudioCtx = createContext<StudioSnapshot | null>(null);

export function StudioProvider({ snapshot, children }: {
  snapshot: StudioSnapshot;
  children: React.ReactNode;
}): React.ReactElement {
  return <StudioCtx.Provider value={snapshot}>{children}</StudioCtx.Provider>;
}

export function useStudio(): StudioSnapshot {
  const ctx = useContext(StudioCtx);
  if (!ctx) throw new Error('useStudio must be used within a <StudioProvider>');
  return ctx;
}
