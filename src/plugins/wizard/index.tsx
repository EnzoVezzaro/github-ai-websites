import type { Plugin, Tool } from '../types';
import type { ContentSlot, BoxType } from '../../types';
import { loadUniverses, saveUniverse } from '../../lib/universes';
import type { Universe, ContentBox } from '../../types';

function getContentBox(universe: Universe, boxId: string): ContentBox | undefined {
  return Object.values(universe.content).flat().find(b => b.id === boxId);
}

function getContentBoxes(universe: Universe): ContentBox[] {
  return Object.values(universe.content).flat();
}

function addBoxToZone(universe: Universe, box: ContentBox, zone: string): Universe {
  if (!universe.content[zone]) {
    universe.content[zone] = [];
  }
  universe.content[zone].push(box);
  return universe;
}

function removeBoxFromZone(universe: Universe, boxId: string): Universe {
  const boxes = getContentBoxes(universe);
  const idx = boxes.findIndex(b => b.id === boxId);
  if (idx === -1) return universe;

  // Remove from whichever zone it belongs to
  for (const zone of Object.keys(universe.content)) {
    const zoneIdx = universe.content[zone].findIndex(b => b.id === boxId);
    if (zoneIdx !== -1) {
      universe.content[zone].splice(zoneIdx, 1);
      break;
    }
  }
  return universe;
}

const tools: Tool[] = [
  {
    name: 'wizard_add_box',
    description: 'Add a content box to a universe',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID' },
        zone: { type: 'string', description: 'Target zone name' },
        type: { type: 'string', description: 'Box type (heading, text, markdown, image, video, list, quote, code, embed, divider)' },
        data: { type: 'string', description: 'Content data' },
        meta: { type: 'string', description: 'Optional metadata (alt text for images)' },
      },
      required: ['universeId', 'zone', 'type', 'data'],
    },
    execute: async (params) => {
      const { universeId, zone, type, data, meta } = params as {
        universeId: string;
        zone: string;
        type: string;
        data: string;
        meta?: string;
      };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      const box: ContentBox = {
        id: `box-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        zone: zone as ContentSlot,
        type: type as BoxType,
        data,
        meta,
      };

      addBoxToZone(universe, box, zone);
      saveUniverse(universe);
      return { success: true, data: box };
    },
  },
  {
    name: 'wizard_update_box',
    description: 'Update a content box in a universe',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID' },
        boxId: { type: 'string', description: 'Box ID' },
        data: { type: 'string', description: 'Updated content' },
        zone: { type: 'string', description: 'Updated zone' },
        type: { type: 'string', description: 'Updated type' },
      },
      required: ['universeId', 'boxId'],
    },
    execute: async (params) => {
      const { universeId, boxId, data, zone, type } = params as {
        universeId: string;
        boxId: string;
        data?: string;
        zone?: string;
        type?: string;
      };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      const box = getContentBox(universe, boxId);
      if (!box) return { success: false, error: 'Box not found' };

      if (data !== undefined) box.data = data;
      if (zone !== undefined) {
        // Remove from old zone, add to new
        removeBoxFromZone(universe, boxId);
        addBoxToZone(universe, box, zone);
      }
      if (type !== undefined) box.type = type as BoxType;

      saveUniverse(universe);
      return { success: true, data: box };
    },
  },
  {
    name: 'wizard_remove_box',
    description: 'Remove a content box from a universe',
    parameters: {
      type: 'object',
      properties: {
        universeId: { type: 'string', description: 'Universe ID' },
        boxId: { type: 'string', description: 'Box ID' },
      },
      required: ['universeId', 'boxId'],
    },
    execute: async (params) => {
      const { universeId, boxId } = params as { universeId: string; boxId: string };
      const universes = loadUniverses();
      const universe = universes.find(u => u.meta.id === universeId);
      if (!universe) return { success: false, error: 'Universe not found' };

      removeBoxFromZone(universe, boxId);
      saveUniverse(universe);
      return { success: true };
    },
  },
  {
    name: 'wizard_list_boxes',
    description: 'List all content boxes in a universe',
    parameters: {
      type: 'object',
      properties: {},
    },
    execute: async () => {
      const universes = loadUniverses();
      // Find the first universe or return empty
      const universe = universes[0];
      if (!universe) return { success: true, data: { boxes: [] } };

      const boxes = getContentBoxes(universe);
      return { success: true, data: { boxes } };
    },
  },
];
export const wizardPlugin: Plugin = {
  id: 'wizard',
  name: 'Content Wizard',
  description: 'Add, update, remove and list content boxes within universes via AI tools.',
  enabledByDefault: true,
  category: 'editing',
  tools,
  SettingsSection: () => (
    <div className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2">
      <div className="text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">Content Wizard</div>
      <p className="text-[10px] text-[#484f58]">AI tools for managing content boxes across universes.</p>
    </div>
  ),
};

export default wizardPlugin;