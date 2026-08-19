// Plugin system
export { PluginProvider, usePlugins, usePluginEnabled } from './PluginProvider';
export { pluginRegistry } from './registry';
export { toolRegistry } from './toolRegistry';
export type { Plugin, PluginPanelProps, PluginNavProps, PluginSettingsProps, PluginCanvasProps, Tool, ToolResult } from './types';

// Individual plugins
export { collaborationPlugin } from './collaboration';
export { spatialPlugin } from './spatial';
export { spatialThemesPlugin } from './spatial-themes';
export { forgePlugin } from './forge';
export { wizardPlugin } from './wizard';
export { githubPlugin } from './github';
export { uiPlugin } from './ui';
export { fabricThemePlugin } from './fabric-theme';
export { themePlugin } from './theme';
export { generatorEnginePlugin } from './generator-engine';
export { mcpPlugin } from './mcp';
export { analysisPlugin } from './analysis';

// All plugins in default order
import { collaborationPlugin } from './collaboration';
import { spatialPlugin } from './spatial';
import { spatialThemesPlugin } from './spatial-themes';
import { forgePlugin } from './forge';
import { wizardPlugin } from './wizard';
import { githubPlugin } from './github';
import { uiPlugin } from './ui';
import { fabricThemePlugin } from './fabric-theme';
import { themePlugin } from './theme';
import { generatorEnginePlugin } from './generator-engine';
import { mcpPlugin } from './mcp';
import { analysisPlugin } from './analysis';
import type { Plugin } from './types';
import { pluginRegistry } from './registry';

export const allPlugins: Plugin[] = [
  uiPlugin,
  spatialPlugin,
  spatialThemesPlugin,
  forgePlugin,
  wizardPlugin,
  githubPlugin,
  collaborationPlugin,
  fabricThemePlugin,
  themePlugin,
  generatorEnginePlugin,
  mcpPlugin,
  analysisPlugin,
];

// Register the built-in suite into the plugin registry on import so the
// registry (and its persisted enabled/disabled state) is always ready.
pluginRegistry.registerAll(allPlugins);
