import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProjects, mockLayouts } from '../lib/mock';
import { lsGet, lsSet, Keys } from '../lib/storage';
import { Preview } from './Preview';
import { Editor } from './Editor';
import type { ExplorerState, ProjectContent } from '../types';

export function Explorer() {
  const [state, setState] = useState<ExplorerState>({ projectId: 'ocean', layoutId: 'brutalist' });
  const [editMode, setEditMode] = useState(false);
  const [projectDraft, setProjectDraft] = useState<ProjectContent>(
    mockProjects.find(p => p.id === state.projectId)!
  );

  useEffect(() => {
    const saved = lsGet<ExplorerState>(Keys.explorerState);
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    lsSet(Keys.explorerState, state);
    const url = new URL(window.location.href);
    url.searchParams.set('p', state.projectId);
    url.searchParams.set('l', state.layoutId);
    window.history.replaceState({}, '', url.toString());
  }, [state]);

  useEffect(() => {
    setProjectDraft(mockProjects.find(p => p.id === state.projectId)!);
  }, [state.projectId]);

  const project = useMemo(() => projectDraft, [projectDraft]);
  const layout = useMemo(() => mockLayouts.find(l => l.meta.id === state.layoutId)!, [state.layoutId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-semibold tracking-tight">
            Github AI Web Forge
          </motion.h1>
          <button onClick={() => setEditMode(v => !v)} className="btn">
            {editMode ? 'Explorer' : 'Edit Mode'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
              <h2 className="font-medium mb-3">Content</h2>
              <select value={state.projectId} onChange={e => setState(s => ({ ...s, projectId: e.target.value }))} className="select">
                {mockProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }} className="card p-5">
              <h2 className="font-medium mb-3">Layout</h2>
              <select value={state.layoutId} onChange={e => setState(s => ({ ...s, layoutId: e.target.value }))} className="select">
                {mockLayouts.map(l => <option key={l.meta.id} value={l.meta.id}>{l.meta.name}</option>)}
              </select>
            </motion.div>
          </aside>

          <section className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.projectId + state.layoutId}
                layoutId="preview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="card overflow-hidden"
              >
                <Preview project={project} layout={layout} editMode={editMode} />
              </motion.div>
            </AnimatePresence>

            {editMode && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <h3 className="font-medium mb-4">Edit Content</h3>
                <Editor project={projectDraft} onChange={setProjectDraft} />
              </motion.div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
