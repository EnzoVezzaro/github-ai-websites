import type { Plugin } from '../types';

interface ShortcutConfig {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  action: string;
}

const SHORTCUTS: Record<string, ShortcutConfig> = {
  'h': { key: 'h', action: 'open_hub' },
  'w': { key: 'w', action: 'open_wizard' },
  'f': { key: 'f', action: 'open_forge' },
  'e': { key: 'e', action: 'open_explore' },
  's': { key: 's', meta: true, action: 'save_universe' },
  'Escape': { key: 'Escape', action: 'close_modal' },
  '?': { key: '/', shift: true, action: 'show_shortcuts' },
};

let shortcutCallback: ((action: string) => void) | null = null;

export function setShortcutHandler(handler: (action: string) => void) {
  shortcutCallback = handler;
}

export function ShortcutPlugin(): Plugin {
  return {
    id: 'shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Control the whole control plane with keyboard shortcuts',
    enabledByDefault: true,
    category: 'core',
    init() {
      console.log('[Shortcuts] Plugin initialized');
      
      const handleKeyDown = (e: KeyboardEvent) => {
        const key = e.key === '/' ? e.key : e.key.toLowerCase();
        
        for (const [id, config] of Object.entries(SHORTCUTS)) {
          const matchesKey = config.key === key || config.key.toLowerCase() === key;
          const matchesMeta = config.meta ? e.metaKey : !e.metaKey;
          const matchesCtrl = config.ctrl ? e.ctrlKey : !e.ctrlKey;
          const matchesShift = config.shift ? e.shiftKey : !e.shiftKey;
          
          if (matchesKey && matchesMeta && matchesCtrl && matchesShift) {
            e.preventDefault();
            e.stopPropagation();
            shortcutCallback?.(config.action);
            console.log(`[Shortcuts] Triggered: ${config.action} (${id})`);
            return;
          }
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    },
    tools: [
      {
        name: 'list_shortcuts',
        description: 'List all available keyboard shortcuts',
        parameters: { type: 'object', properties: {}, required: [] },
        execute: async () => {
          const shortcuts = Object.entries(SHORTCUTS).map(([id, config]) => ({
            id,
            key: config.key,
            meta: config.meta || false,
            ctrl: config.ctrl || false,
            shift: config.shift || false,
            action: config.action
          }));
          return { success: true, data: { shortcuts } };
        }
      },
      {
        name: 'trigger_shortcut',
        description: 'Trigger a keyboard shortcut action programmatically',
        parameters: {
          type: 'object',
          properties: {
            action: { type: 'string', description: 'Action to trigger' }
          },
          required: ['action']
        },
        execute: async (params) => {
          shortcutCallback?.(params.action as string);
          return { success: true, data: { triggered: params.action } };
        }
      }
    ]
  };
}

export function ShortcutHelp() {
  return (
    <div className="fixed bottom-4 right-4 bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-xs font-mono z-50">
      <div className="text-[#8b949e] mb-2">⌨️ Shortcuts</div>
      <div className="space-y-1 text-[#c9d1d9]">
        <div>H - Hub</div>
        <div>W - Wizard</div>
        <div>F - Forge</div>
        <div>E - Explore</div>
        <div>⌘S - Save</div>
        <div>ESC - Close</div>
        <div>⇧? - Help</div>
      </div>
    </div>
  );
}

export default ShortcutPlugin;
