import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpatialState, SpatialZone, ContentSlot, ContentSlotType } from '../lib/spatial';
import { getDefaultSpatialState } from '../lib/spatial';
import { useCollaboration } from '../context/CollaborationContext';
import type { ProjectContent } from '../types';
import { GripVertical, ArrowLeftRight } from 'lucide-react';
import { SpatialEngine } from '../spatial/engine';
import type { SpatialBounds } from '../spatial/types';
import { reflow, snapPull, type ZoneLayoutKind } from '../spatial/engine/adaptiveZones';
import { useActiveTheme, useSpatialStore } from '../store/spatialStore';
import { toTransition } from '../themes';

interface SpatialCanvasProps {
  layoutId: string;
  project: ProjectContent;
  onSlotMove?: (slotId: string, newZoneId: string | null) => void;
  onSwapSlots?: (slotA: string, slotB: string) => void;
  editing?: boolean;
}

const SLOT_COLORS: Record<ContentSlotType, string> = {
  intro: '#58a6ff',
  story: '#d2a8ff',
  ideas: '#d29922',
  media: '#3fb950',
  closing: '#f85149',
};

const SLOT_LABELS: Record<ContentSlotType, string> = {
  intro: 'Intro',
  story: 'Story',
  ideas: 'Ideas',
  media: 'Media',
  closing: 'Closing',
};

const ZONE_LAYOUT_PRESET: Record<string, ZoneLayoutKind> = {
  'z-intro': 'row',
  'z-story': 'grid',
  'z-ideas': 'column',
  'z-media': 'row',
  'z-closing': 'row',
};

const ZONE_PRIORITY: Record<ContentSlotType, number> = {
  intro: 9,
  story: 8,
  ideas: 6,
  media: 6,
  closing: 3,
};

const CARD_INSET = 7;
const FREE_WIDTH = 220;

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function naturalSize(content: string): { width: number; height: number } {
  const len = content?.length ?? 0;
  return {
    width: clamp(0.18 + len * 0.0008, 0.18, 0.55),
    height: clamp(0.12 + len * 0.0005, 0.12, 0.4),
  };
}

export function SpatialCanvas({ layoutId, project, onSlotMove, onSwapSlots, editing = false }: SpatialCanvasProps) {
  const [state, setState] = useState<SpatialState>(() => getDefaultSpatialState(layoutId));
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [snapTarget, setSnapTarget] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [movedZones, setMovedZones] = useState<Record<string, SpatialBounds>>({});
  // Blocks dropped in empty space float freely (not packed in any zone).
  const [freeBlocks, setFreeBlocks] = useState<Record<string, SpatialBounds>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, slotX: 0, slotY: 0 });

  const { syncProject } = useCollaboration();

  const theme = useActiveTheme();
  const engineRef = useRef<SpatialEngine | null>(null);
  const [nearSlots, setNearSlots] = useState<Array<{ source: string; target: string }>>([]);

  const zones = state.zones;
  const slots = state.slots;

  const getContentForSlot = useCallback((slot: ContentSlot): string => {
    return (project as any)[slot.type] || '';
  }, [project]);

  const zoneInputs = useMemo(() => zones.map(z => ({
    id: z.id,
    layout: ZONE_LAYOUT_PRESET[z.id] ?? 'grid',
    priority: ZONE_PRIORITY[z.compatibleSlots[0]] ?? 5,
    preferred: movedZones[z.id] ?? { x: z.x, y: z.y, width: z.width, height: z.height },
  })), [zones, movedZones]);

  const objectsByZone = useMemo(() => {
    const map: Record<string, Array<{ id: string; size: { width: number; height: number } }>> = {};
    for (const slot of slots) {
      if (!slot.zoneId) continue;
      map[slot.zoneId] ??= [];
      map[slot.zoneId].push({ id: slot.id, size: naturalSize(getContentForSlot(slot)) });
    }
    return map;
  }, [slots, getContentForSlot]);

  // The composition: zones sized/packed from their blocks + neighbors reflowed.
  const composition = useMemo(() => {
    return reflow(zoneInputs, objectsByZone, { x: 0, y: 0, width: 1, height: 1 });
  }, [zoneInputs, objectsByZone]);

  const zoneBoundsById = useMemo(() => {
    const map: Record<string, SpatialBounds> = {};
    for (const z of composition.zones) map[z.id] = z.bounds;
    return map;
  }, [composition]);

  useEffect(() => {
    setState(getDefaultSpatialState(layoutId));
    setNearSlots([]);
    setMovedZones({});
    setFreeBlocks({});
  }, [layoutId, theme?.id]);

  useEffect(() => {
    const objects: Record<string, SpatialBounds> = { ...composition.objects };
    for (const [id, b] of Object.entries(freeBlocks)) objects[id] = b;
    const engine = new SpatialEngine(
      Object.entries(objects).map(([id, bounds]) => ({
        id: `obj:${id}`,
        bounds,
        preferredZone: id,
        data: { slotType: id },
      })),
      composition.zones.map(z => ({
        id: z.id,
        type: 'content',
        bounds: z.bounds,
        capacity: 'infinite',
        layout: z.layout === 'row' || z.layout === 'column' ? 'grid' : z.layout === 'stack' ? 'stack' : z.layout === 'cluster' ? 'cluster' : 'grid',
        priority: z.priority,
      })),
      { proximityThreshold: 0.22, snapThreshold: 0.14 },
    );
    engineRef.current = engine;
    useSpatialStore.getState().setEngine(engine);
    return () => {
      useSpatialStore.getState().clear();
    };
  }, [composition, freeBlocks]);

  useEffect(() => {
    if (state.slots.length > 0) {
      const ySlots = state.slots.map(s => `${s.id}:${s.zoneId ?? 'free'}`);
      syncProject({ ...project, _spatialSlots: ySlots } as any);
    }
  }, [state, syncProject, project]);

  const toViewport = useCallback((bounds: SpatialBounds) => {
    if (!canvasRef.current) return { x: 0, y: 0, w: 0, h: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: bounds.x * rect.width,
      y: bounds.y * rect.height,
      w: bounds.width * rect.width,
      h: bounds.height * rect.height,
    };
  }, []);

  const getSlotViewportPos = useCallback((slot: ContentSlot) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const bounds = freeBlocks[slot.id] ?? composition.objects[slot.id];
    if (!bounds) return { x: 0, y: 0 };
    return { x: bounds.x * rect.width, y: bounds.y * rect.height };
  }, [composition, freeBlocks]);

  const handleSlotMouseDown = useCallback((e: React.MouseEvent, slotId: string) => {
    if (!editing) return;
    e.preventDefault();
    e.stopPropagation();
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    const pos = getSlotViewportPos(slot);
    dragStart.current = { x: e.clientX, y: e.clientY, slotX: pos.x, slotY: pos.y };
    setDragging(slotId);
    setSelectedSlot(slotId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      engineRef.current?.dragStart(`obj:${slotId}`, { x: pos.x / rect.width, y: pos.y / rect.height });
    }
  }, [editing, slots, getSlotViewportPos]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      let newX = dragStart.current.slotX + dx;
      let newY = dragStart.current.slotY + dy;
      setDragPos({ x: newX, y: newY });

      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const normX = newX / rect.width;
      const normY = newY / rect.height;

      const slot = slots.find(s => s.id === dragging);
      if (!slot) return;

      // Magnetic pull: the closer to a zone, the stronger the attraction.
      let targetZone: SpatialZone | null = null;
      let pull = { dx: 0, dy: 0, strength: 0 };
      for (const z of zones) {
        const zb = zoneBoundsById[z.id];
        if (!zb) continue;
        const p = snapPull({ x: normX, y: normY }, zb, 0.14);
        if (p.strength > 0.05 && (!targetZone || p.strength > pull.strength)) {
          targetZone = z;
          pull = p;
        }
      }
      if (targetZone) {
        setSnapTarget(targetZone.id);
        setDragPos({ x: newX + pull.dx * rect.width, y: newY + pull.dy * rect.height });
      } else {
        setSnapTarget(null);
      }

      const px = (newX + pull.dx * rect.width) / rect.width;
      const py = (newY + pull.dy * rect.height) / rect.height;
      engineRef.current?.move(`obj:${slot.id}`, { x: px, y: py });
      const snap = engineRef.current?.getSnapshot();
      const near = (snap?.nearPairs ?? [])
        .map(p => ({ source: p.source.replace('obj:', ''), target: p.target.replace('obj:', '') }));
      setNearSlots(near);
    };

    const handleMouseUp = () => {
      if (!canvasRef.current || !dragging) {
        setDragging(null);
        setSnapTarget(null);
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const normX = dragPos.x / rect.width;
      const normY = dragPos.y / rect.height;
      const slot = slots.find(s => s.id === dragging);
      if (!slot) { setDragging(null); setSnapTarget(null); return; }

      engineRef.current?.dragEnd(`obj:${slot.id}`, { x: normX, y: normY });

      // Find the zone this block settles into.
      let dropped: SpatialZone | null = null;
      let bestStrength = 0;
      for (const z of zones) {
        const zb = zoneBoundsById[z.id];
        if (!zb) continue;
        const p = snapPull({ x: normX, y: normY }, zb, 0.16);
        if (p.strength > bestStrength) {
          bestStrength = p.strength;
          dropped = z;
        }
      }

      // Merge/group: dropped onto a nearby block → the engine groups them.
      const nearTarget = nearSlots.find(p => p.source === dragging || p.target === dragging);
      const other = nearTarget ? (nearTarget.source === dragging ? nearTarget.target : nearTarget.source) : null;

      if (dropped) {
        engineRef.current?.snap(`obj:${slot.id}`, dropped.id);
        if (other && other !== slot.id && !slots.find(s => s.id === other && !s.zoneId)) {
          engineRef.current?.combine(`obj:${slot.id}`, `obj:${other}`);
        }
        setState(prev => ({
          ...prev,
          slots: prev.slots.map(s => s.id === dragging ? { ...s, zoneId: dropped!.id, offsetX: 0, offsetY: 0 } : s),
        }));
        setFreeBlocks(prev => {
          const next = { ...prev };
          delete next[slot.id];
          return next;
        });
        onSlotMove?.(slot.id, dropped.id);
      } else {
        // Dropped in empty space → the block is now free, floating anywhere.
        const w = (freeBlocks[slot.id]?.width ?? composition.objects[slot.id]?.width ?? 0.2);
        const h = (freeBlocks[slot.id]?.height ?? composition.objects[slot.id]?.height ?? 0.16);
        setFreeBlocks(prev => ({
          ...prev,
          [slot.id]: { x: clamp(normX - w / 2, 0, 1 - w), y: clamp(normY - h / 2, 0, 1 - h), width: w, height: h },
        }));
        setState(prev => ({
          ...prev,
          slots: prev.slots.map(s => s.id === dragging ? { ...s, zoneId: null as string | null, offsetX: 0, offsetY: 0 } : s),
        }));
        onSlotMove?.(slot.id, null);
      }

      setDragging(null);
      setSnapTarget(null);
      setNearSlots([]);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragPos, zones, slots, nearSlots, theme, zoneBoundsById, composition, freeBlocks, onSlotMove]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      onClick={() => !dragging && setSelectedSlot(null)}
    >
      {/* Zones — invisible spatial attractors (subtle outline only while dragging/near) */}
      {composition.zones.map(zone => {
        const vp = toViewport(zone.bounds);
        const isSnap = snapTarget === zone.id;
        const original = zones.find(z => z.id === zone.id);
        const active = editing || dragging;
        if (!active) return null;

        return (
          <div
            key={zone.id}
            className={`absolute rounded-lg border-2 border-dashed pointer-events-none transition-all duration-300 ${isSnap ? 'border-[#58a6ff] bg-white/[0.02]' : 'border-[#30363d]/25'}`}
            style={{
              left: vp.x,
              top: vp.y,
              width: vp.w,
              height: vp.h,
              ...(isSnap ? { borderColor: theme?.visuals.accent, backgroundColor: `${theme?.visuals.accent}10` } : {}),
            }}
          >
            {(editing) && (
              <div className="absolute top-1 left-1.5 text-[9px] text-[#6e7681] font-mono pointer-events-none uppercase tracking-widest">
                {original?.label ?? zone.id}
              </div>
            )}
          </div>
        );
      })}

      {theme?.effects.gooey && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden>
          {theme.objectEffects?.({ width: 0, height: 0 })}
        </div>
      )}

      {/* Proximity connections — the theme decides how nearby blocks look. */}
      {theme?.connection.enabled && nearSlots.length > 0 && dragging && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {nearSlots.map((pair, i) => {
            const a = engineRef.current?.getObject(`obj:${pair.source}`);
            const b = engineRef.current?.getObject(`obj:${pair.target}`);
            if (!a || !b || !theme?.connection.render) return null;
            return (
              <div key={i} className="absolute inset-0">
                {theme.connection.render(a, b)}
              </div>
            );
          })}
        </div>
      )}

      {/* Blocks */}
      <AnimatePresence>
        {slots.map(slot => {
          const isDragging = dragging === slot.id;
          const isSelected = selectedSlot === slot.id;
          const color = SLOT_COLORS[slot.type];
          const transition = theme ? toTransition(theme.motion.snap) : { type: 'spring' as const, stiffness: 400, damping: 25 };
          const dragScale = theme?.effects.dragScale ?? 1;
          const glassBlur = theme?.effects.glass.blur ?? 0;
          const packed = freeBlocks[slot.id] ?? composition.objects[slot.id];

          let style: React.CSSProperties;
          if (isDragging) {
            style = {
              position: 'fixed',
              left: dragPos.x,
              top: dragPos.y,
              zIndex: 1000,
              width: FREE_WIDTH,
            };
          } else if (packed) {
            const vp = toViewport(packed);
            style = {
              position: 'absolute',
              left: vp.x + CARD_INSET,
              top: vp.y + CARD_INSET,
              width: Math.max(0, vp.w - CARD_INSET * 2),
              height: Math.max(0, vp.h - CARD_INSET * 2),
              zIndex: slot.z + (isSelected ? 100 : 0),
            };
          } else {
            return null;
          }

          return (
            <motion.div
              key={slot.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: isDragging ? 0.9 : 1,
                scale: isDragging ? dragScale : isSelected ? 1.02 : 1,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={transition as React.ComponentProps<typeof motion.div>['transition']}
              className={`overflow-hidden cursor-pointer select-none ${isDragging ? 'shadow-2xl' : ''} ${isSelected ? 'ring-2' : ''}`}
              style={{
                ...style,
                borderRadius: theme?.visuals.radius ?? 12,
                backgroundColor: theme?.visuals.cardBackground ?? 'rgba(13,17,23,0.85)',
                backdropFilter: `blur(${glassBlur}px)`,
                border: `1px solid ${theme?.visuals.cardBorder ?? `${color}33`}`,
                boxShadow: theme?.visuals.glow ? `0 0 24px ${theme.visuals.glow}` : undefined,
                ...(theme?.effects.gooey ? { filter: 'url(#gooey-filter)' } : {}),
                ...(isSelected ? { ringColor: color } : {}),
              }}
              onMouseDown={(e) => handleSlotMouseDown(e, slot.id)}
              onClick={(e) => { e.stopPropagation(); setSelectedSlot(slot.id); }}
            >
              <div
                className="flex items-center justify-between px-2 py-1 text-[9px] font-mono uppercase tracking-wider"
                style={{ backgroundColor: `${color}15`, borderBottom: `1px solid ${color}22` }}
              >
                <div className="flex items-center gap-1" style={{ color }}>
                  {editing && <GripVertical className="w-3 h-3 opacity-50" />}
                  <span>{SLOT_LABELS[slot.type]}</span>
                </div>
                {editing && isSelected && (
                  <button
                    className="text-[#8b949e] hover:text-white text-[8px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      const other = slots.find(s => s.id !== slot.id && s.zoneId === slot.zoneId);
                      if (other && onSwapSlots) {
                        onSwapSlots(slot.id, other.id);
                      }
                    }}
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="p-2 text-xs text-[#c9d1d9] overflow-hidden h-full">
                {isDragging ? (
                  <div className="flex items-center justify-center h-full text-[10px] text-[#8b949e] font-mono">
                    Drop in zone...
                  </div>
                ) : (
                  <div className="line-clamp-4 text-[11px] leading-relaxed">
                    {getContentForSlot(slot) || (
                      <span className="text-[#484f58] italic">Empty {SLOT_LABELS[slot.type]} slot</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
