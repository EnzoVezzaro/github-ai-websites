import { useState } from 'react';
import { motion } from 'framer-motion';
import { Grid } from 'lucide-react';
import { useStudio } from '../views/StudioContext';

/** The Hub Archive modal — a community content / universe browser. */
export function HubView() {
  const { setMode, setShowDock, projects, layouts, setProjectId, setLayoutId, setSparkKey } = useStudio();
  const [search] = useState('');
  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  const filteredLayouts = layouts.filter(l => l.meta.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div
      key="hub"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="pointer-events-auto w-full max-w-4xl max-h-[80vh] bg-black/90 border border-white/20 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl flex flex-col"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 flex-shrink-0">
        <div>
          <h2 className="text-xl font-black tracking-tight">The Hub Archive</h2>
          <p className="text-xs text-zinc-400 font-mono">Community content and universes.</p>
        </div>
        <button onClick={() => setMode('explore')} className="px-3.5 py-1.5 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition font-mono">Close</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar-none flex-1">
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-violet-400 font-bold">Content</h3>
          {filteredProjects.map(p => (
            <div key={p.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/50 transition">
              <div className="text-[10px] font-mono text-zinc-500 mb-1">{p.slug}</div>
              <h4 className="font-bold text-sm mb-1">{p.title}</h4>
              <p className="text-xs text-zinc-400 mb-3">{p.intro}</p>
              <button
                onClick={() => { setProjectId(p.id); setMode('explore'); setShowDock(true); setSparkKey(k => k + 1); }}
                className="px-3 py-1.5 rounded-xl text-[10px] bg-violet-600/30 text-violet-200 font-mono"
              >
                Load →
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-fuchsia-400 font-bold">Universes</h3>
          {filteredLayouts.map(l => (
            <div key={l.meta.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-fuchsia-500/50 transition">
              <div className="text-[10px] font-mono text-zinc-500 mb-1">v{l.meta.version}</div>
              <h4 className="font-bold text-sm mb-1">{l.meta.name}</h4>
              <p className="text-xs text-zinc-400 mb-3">{l.meta.description || 'Custom universe.'}</p>
              <button
                onClick={() => { setLayoutId(l.meta.id); setMode('explore'); setShowDock(true); setSparkKey(k => k + 1); }}
                className="px-3 py-1.5 rounded-xl text-[10px] bg-fuchsia-600/30 text-fuchsia-200 font-mono"
              >
                Enter →
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export const HubIcon = Grid;
