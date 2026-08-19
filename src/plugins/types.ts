import type { ComponentType } from 'react';
import type { ViewID } from '../views/types';

/**
 * A view surface that a plugin can contribute to a core {@link ViewID} slot.
 * Views are rendered by the core `ViewRouter` (see `src/views`) and consume
 * the shared `StudioSnapshot` via `useStudio()`. Keeping views as plugin-owned
 * modules lets every feature bring its own rendering without touching the
 * core layout shell.
 */
export interface PluginView {
  id: ViewID;
  Component: ComponentType;
}

/** A tool that can be invoked by AI agents. */
export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * A plugin is a self-contained feature module that can be enabled/disabled.
 * Plugins register UI components, hooks, lifecycle handlers, tools, and views.
 */
export interface Plugin {
  id: string;
  name: string;
  description: string;
  enabledByDefault: boolean;
  locked?: boolean;
  category: 'core' | 'editing' | 'collaboration' | 'layout' | 'publishing';

  init?: () => void | Promise<void>;
  destroy?: () => void;

  tools?: Tool[];

  /** Views this plugin contributes to core view slots. */
  views?: PluginView[];

  Panel?: ComponentType<PluginPanelProps>;
  NavButton?: ComponentType<PluginNavProps>;
  SettingsSection?: ComponentType<PluginSettingsProps>;
  CanvasOverlay?: ComponentType<PluginCanvasProps>;
}

export interface PluginPanelProps {
  onClose: () => void;
}

export interface PluginNavProps {
  active: boolean;
  onClick: () => void;
}

export interface PluginSettingsProps {}

export interface PluginCanvasProps {
  projectId: string;
  layoutId: string;
}

/**
 * Plugin registry state
 */
export interface PluginState {
  plugins: Map<string, Plugin>;
  enabled: Set<string>;
}
