import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import { lsGet, lsSet } from '../lib/storage';

interface PanelState {
  x: number;
  y: number;
  visible: boolean;
  shape?: PanelShape;
}

const SHAPES = ['rounded', 'smooth', 'pill', 'sharp'] as const;
type PanelShape = typeof SHAPES[number];

const SHAPE_CLASSES: Record<PanelShape, string> = {
  rounded: 'rounded-xl',
  smooth: 'rounded-2xl',
  pill: 'rounded-3xl',
  sharp: 'rounded-none',
};

const SHAPE_NAMES: Record<PanelShape, string> = {
  rounded: 'Standard',
  smooth: 'Smooth',
  pill: 'Pill',
  sharp: 'Sharp',
};

interface DraggablePanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  defaultX?: number;
  defaultY?: number;
  visible?: boolean;
  onClose?: () => void;
  showClose?: boolean;
  showGrip?: boolean;
  /** Bare mode: no title bar — the whole panel is a free-floating draggable surface. */
  bare?: boolean;
  style?: React.CSSProperties;
}

export function DraggablePanel({
  id,
  children,
  className = '',
  defaultX = 0,
  defaultY = 0,
  visible: controlledVisible,
  onClose,
  showClose = true,
  showGrip = true,
  bare = false,
  style,
}: DraggablePanelProps) {
  const storageKey = `panel.${id}`;
  const saved = lsGet<PanelState>(storageKey);
  
  const [shape, setShape] = useState<PanelShape>(saved?.shape ?? 'rounded');
  const [isVisible, setIsVisible] = useState(saved?.visible ?? (controlledVisible ?? true));
  const [position, setPosition] = useState({ 
    x: saved?.x ?? defaultX, 
    y: saved?.y ?? defaultY 
  });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragRef = useRef<HTMLDivElement>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startPosRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    if (controlledVisible !== undefined) setIsVisible(controlledVisible);
  }, [controlledVisible]);

  useEffect(() => {
    if (!isDragging || pointerIdRef.current === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      let newX = startPosRef.current.posX + deltaX;
      let newY = startPosRef.current.posY + deltaY;

      // Clamp to viewport
      const panel = dragRef.current;
      if (panel) {
        const rect = panel.getBoundingClientRect();
        newX = Math.max(0, Math.min(newX, window.innerWidth - rect.width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - rect.height));
      }

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      
      pointerIdRef.current = null;
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      
      lsSet(storageKey, { x: position.x, y: position.y, visible: isVisible, shape });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, position.x, position.y, isVisible, shape, storageKey]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    pointerIdRef.current = e.pointerId;
    setIsDragging(true);
    
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const cycleShape = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (SHAPES.indexOf(shape) + 1) % SHAPES.length;
    const newShape = SHAPES[nextIndex];
    setShape(newShape);
    lsSet(storageKey, { x: position.x, y: position.y, visible: isVisible, shape: newShape });
  }, [shape, position, isVisible, storageKey]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    lsSet(storageKey, { x: position.x, y: position.y, visible: false, shape });
    onClose?.();
  }, [position, shape, storageKey, onClose]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      ref={dragRef}
      className={`absolute z-50 overflow-auto shadow-2xl border border-[#30363d] bg-[#161b22]/95 backdrop-blur-xl ${SHAPE_CLASSES[shape]} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none',
        ...style,
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Title bar */}
      {!bare && (showGrip || showClose) && (
        <div className="flex items-center justify-between px-3 h-9 bg-[#0d1117]/90 border-b border-[#30363d] select-none touch-none backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#8b949e]">
            {showGrip && <GripVertical className="w-3 h-3 opacity-60" />}
            <span className="text-[10px] font-mono uppercase tracking-wider">{id}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={cycleShape}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#30363d] transition-colors"
            >
              {SHAPE_NAMES[shape]}
            </button>
            {showClose && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleClose}
                className="w-5 h-5 rounded flex items-center justify-center text-[#8b949e] hover:text-[#f85149] hover:bg-[#da3633]/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      <div>
        {children}
      </div>
    </motion.div>
  );
}

export function useRestorablePanel(id: string): { visible: boolean; restore: () => void } {
  const storageKey = `panel.${id}`;
  const saved = lsGet<PanelState>(storageKey);
  const [visible, setVisible] = useState(saved?.visible ?? true);

  const restore = () => {
    setVisible(true);
    lsSet(storageKey, { x: saved?.x ?? 0, y: saved?.y ?? 0, visible: true });
  };

  return { visible, restore };
}
