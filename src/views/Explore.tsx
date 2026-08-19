import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';
import { useStudio } from '../views/StudioContext';

/**
 * Floating content / universe inspector that lives at the bottom of the
 * `explore` view. Extracted verbatim from the Studio shell so Studio itself
 * stays layout/presentation-only.
 */
export function ExploreDock() {
  const { projects, layouts, projectId, layoutId, handleProjectChange, handleLayoutChange } = useStudio();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-6 left-6 right-6 z-30 max-w-5xl mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-3 bg-black/75 border border-white/15 rounded-3xl p-4 backdrop-blur-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)]">
          {/* Content Slider */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] uppercase tracking-widest text-violet-400 font-bold flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" /> Content Blocks
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{projects.length} available</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none cursor-grab active:cursor-grabbing">
              {projects.map(p => {
                const active = projectId === p.id;
                return (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleProjectChange(p.id)}
                    className={`flex-shrink-0 w-48 text-left p-2.5 rounded-xl border transition relative overflow-hidden ${active ? 'bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 border-violet-400 shadow-[0_0_20px_rgba(124,58,237,0.4)] text-white' : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}`}
                  >
                    <div className="text-[9px] font-mono uppercase tracking-widest text-violet-300 mb-0.5">{p.slug}</div>
                    <div className="text-xs font-semibold truncate">{p.title}</div>
                    {active && (
                      <motion.div layoutId="active-art-dock" className="absolute inset-0 border-2 border-violet-400 rounded-xl pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Universes Slider */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] uppercase tracking-widest text-fuchsia-400 font-bold flex items-center gap-1 font-mono">
                <Layers className="w-3 h-3" /> Visual Universes
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{layouts.length} worlds</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none cursor-grab active:cursor-grabbing">
              {layouts.map(l => {
                const active = layoutId === l.meta.id;
                return (
                  <motion.button
                    key={l.meta.id}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLayoutChange(l.meta.id)}
                    className={`flex-shrink-0 w-48 text-left p-2.5 rounded-xl border transition relative overflow-hidden ${active ? 'bg-gradient-to-br from-fuchsia-600/40 to-pink-600/40 border-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.4)] text-white' : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}`}
                  >
                    <div className="text-[9px] font-mono uppercase tracking-widest text-fuchsia-300 mb-0.5">By {l.meta.author}</div>
                    <div className="text-xs font-semibold truncate">{l.meta.name}</div>
                    {active && (
                      <motion.div layoutId="active-uni-dock" className="absolute inset-0 border-2 border-fuchsia-400 rounded-xl pointer-events-none" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
