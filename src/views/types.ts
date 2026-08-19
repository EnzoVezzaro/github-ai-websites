import type { ComponentType } from 'react';
import type { ProjectContent, LayoutFiles } from '../types';

/**
 * High-level application views (core routing/navigation surfaces).
 * Everything else lives behind the plugin system (see `../plugins`).
 */
export type ViewID = 'explore' | 'hub' | 'edit' | 'forge' | 'publish' | 'settings';

export type PubStep =
  | 'idle' | 'preparing' | 'sending' | 'pr' | 'checks'
  | 'publishing' | 'success' | 'error';

/** Metadata describing a core view (used by nav, registries, plugin seams). */
export interface ViewMeta {
  id: ViewID;
  label: string;
  /** lucide icon import name (string token kept here to avoid coupling views to icons). */
  icon: string;
  tooltip: string;
  order: number;
}

/**
 * Shared, read+write snapshot of Studio state that views consume through
 * `useStudio()`. This decouples the per-mode views from the Studio shell so
 * they can be developed / tested independently and contributed by plugins.
 */
export interface StudioSnapshot {
  // routing
  mode: ViewID;
  setMode: (m: ViewID) => void;
  showDock: boolean;
  setShowDock: (v: boolean) => void;

  // identity
  projectId: string;
  layoutId: string;
  setProjectId: (id: string) => void;
  setLayoutId: (id: string) => void;

  // data
  projects: ProjectContent[];
  layouts: LayoutFiles[];
  currentProject: ProjectContent;
  currentLayout: LayoutFiles;
  activeLayout: LayoutFiles;

  // content wizard
  projectDraft: ProjectContent;
  setProjectDraft: (p: ProjectContent) => void;
  wizardStep: number;
  setWizardStep: (n: number) => void;
  totalWizardSteps: number;

  // forge
  forgeHtml: string;
  setForgeHtml: (v: string) => void;
  forgeCss: string;
  setForgeCss: (v: string) => void;
  forgeName: string;
  setForgeName: (v: string) => void;

  // publish
  pubStep: PubStep;
  setPubStep: (s: PubStep) => void;

  // misc
  timeLeft: string;
  sparkKey: number;
  setSparkKey: (k: number | ((prev: number) => number)) => void;

  // derived handlers
  handleProjectChange: (id: string) => void;
  handleLayoutChange: (id: string) => void;
  handleSaveProject: () => void;
  handleCreateLayout: () => void;
  startPublishing: () => void;
}

/** A view component rendered by the {@link ViewRouter}. */
export interface View {
  id: ViewID;
  Component: ComponentType;
}
