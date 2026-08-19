import type { Plugin } from '../types';
import { ShareButton, UserPresence } from '../../components/CollabUI';

export const collaborationPlugin: Plugin = {
  id: 'collaboration',
  name: 'Real-Time Collaboration',
  description: 'Multi-user editing via Yjs/WebRTC with presence, cursors, and shared state.',
  enabledByDefault: true,
  category: 'collaboration',

  NavButton: () => null, // Uses ShareButton directly

  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Collaboration</div>
      <p className="text-[10px] text-[#484f58]">Peer-to-peer editing via WebRTC. No server required.</p>
      <div className="flex items-center gap-2">
        <ShareButton />
        <UserPresence />
      </div>
    </div>
  ),
};

export default collaborationPlugin;
