import type { Plugin } from '../types';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

export const tldrawPlugin: Plugin = {
  id: 'tldraw',
  name: 'TLDraw Whiteboard',
  description: 'Collaborative whiteboard overlay for sketching and annotating on top of your project.',
  enabledByDefault: false,
  category: 'editing',

  Panel: ({ onClose }) => (
    <div className="pointer-events-auto w-full h-full bg-white relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-50 px-2 py-1 rounded text-[10px] bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]"
      >
        Close Whiteboard
      </button>
      <Tldraw />
    </div>
  ),

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="flex items-center gap-2 text-[#8b949e] font-mono text-[10px] uppercase tracking-wider">
        TLDraw Whiteboard
      </div>
      <p className="text-[10px] text-[#484f58]">
        Adds a collaborative whiteboard overlay for sketching layouts, annotating, and brainstorming.
      </p>
    </div>
  ),
};
