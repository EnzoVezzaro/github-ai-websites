import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProjects, mockLayouts } from '../lib/mock';
import { Preview } from './Preview';
import type { ProjectContent, LayoutFiles } from '../types';
import { Edit3, Code, Send, Settings, Compass, Orbit, Sparkles, Layers, Grid, Sliders, ArrowRight, ArrowLeft, Check, GitPullRequest, ExternalLink } from 'lucide-react';

export function Studio() {
  const [projectId, setProjectId] = useState('ocean');
  const [layoutId, setLayoutId] = useState('brutalist');
  const [mode, setMode] = useState<'explore' | 'hub' | 'edit' | 'forge' | 'publish' | 'settings'>('explore');
  const [showDock, setShowDock] = useState(true);

  const [projects, setProjects] = useState<ProjectContent[]>(mockProjects);
  const [layouts, setLayouts] = useState<LayoutFiles[]>(mockLayouts);

  const [sparkKey, setSparkKey] = useState(0);

  const handleProjectChange = (id: string) => {
    if (id !== projectId) {
      setProjectId(id);
      setSparkKey(k => k + 1);
    }
  };

  const handleLayoutChange = (id: string) => {
    if (id !== layoutId) {
      setLayoutId(id);
      setSparkKey(k => k + 1);
    }
  };

  const currentProject = useMemo(() => projects.find(p => p.id === projectId) || projects[0], [projects, projectId]);
  const currentLayout = useMemo(() => layouts.find(l => l.meta.id === layoutId) || layouts[0], [layouts, layoutId]);

  // Forge live layout state
  const [forgeHtml, setForgeHtml] = useState(`<!doctype html><html><head><style>{{css}}</style></head><body class="custom-world"><header><h1>{{intro}}</h1></header><main><p>{{story}}</p><p>{{ideas}}</p></main><div class="media">{{media}}</div><footer><p>{{closing}}</p></footer></body></html>`);
  const [forgeCss, setForgeCss] = useState(`body{background:#0a0a0c;color:#e2e8f0;font-family:system-ui;padding:4rem;max-width:800px;margin:auto}.custom-world{line-height:1.6}h1{font-size:2.5rem;font-weight:900;margin-bottom:2rem;background:linear-gradient(to right,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{font-size:1.15rem;margin-bottom:1.5rem;color:#cbd5e1}.media img{width:100%;height:350px;object-fit:cover;border-radius:16px;margin:2rem 0;border:1px solid rgba(255,255,255,0.1)}footer{margin-top:3rem;font-size:1.25rem;font-style:italic;color:#94a3b8}`);
  const [forgeName, setForgeName] = useState('Universe 05 // Custom');

  const activeLayout = useMemo(() => {
    if (mode === 'forge') {
      return {
        meta: { id: 'forge-live', name: forgeName, author: 'You', version: '1.0', updatedAt: new Date().toISOString() },
        html: forgeHtml,
        css: forgeCss
      };
    }
    return currentLayout;
  }, [mode, forgeHtml, forgeCss, forgeName, currentLayout]);

  // Content Wizard State
  const [projectDraft, setProjectDraft] = useState<ProjectContent>(currentProject);
  const [wizardStep, setWizardStep] = useState(1);
  const totalWizardSteps = 6;

  // GitHub Publishing Live Activity State
  const [pubStep, setPubStep] = useState<'idle' | 'preparing' | 'sending' | 'pr' | 'checks' | 'publishing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setProjectDraft(currentProject);
    setWizardStep(1);
  }, [currentProject]);

  const [timeLeft, setTimeLeft] = useState('23h 41m 55s');
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft('23h 41m 20s'), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveProject = () => {
    setProjects(ps => ps.map(p => p.id === projectDraft.id ? projectDraft : p));
    setSparkKey(k => k + 1);
    setMode('explore');
  };

  const handleCreateLayout = () => {
    const newLayout: LayoutFiles = {
      meta: {
        id: `custom-${Date.now()}`,
        name: forgeName,
        author: 'You',
        version: '1.0',
        updatedAt: new Date().toISOString()
      },
      html: forgeHtml,
      css: forgeCss
    };
    setLayouts(ls => [newLayout, ...ls]);
    setLayoutId(newLayout.meta.id);
    setSparkKey(k => k + 1);
    setMode('explore');
  };

  const startPublishing = () => {
    setPubStep('preparing');
    setTimeout(() => setPubStep('sending'), 800);
    setTimeout(() => setPubStep('pr'), 1600);
    setTimeout(() => setPubStep('checks'), 2500);
    setTimeout(() => setPubStep('publishing'), 3500);
    setTimeout(() => setPubStep('success'), 4500);
  };

  return (
    <div className="h-screen w-screen bg-black text-zinc-100 selection:bg-violet-500/30 overflow-hidden relative font-sans">
      {/* Spark Flash Overlay on Swap */}
      <AnimatePresence>
        <motion.div
          key={sparkKey}
          initial={{ opacity: 0.9, scale: 0.98 }}
          animate={{ opacity: 0, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 pointer-events-none z-50 border-[4px] border-violet-500/70 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 backdrop-blur-[3px]"
        />
      </AnimatePresence>

      {/* Full-Screen Website Hero (Live Rendered) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <motion.div
          key={`${projectId}-${mode === 'forge' ? 'forge' : layoutId}`}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          <Preview project={currentProject} layout={activeLayout} />
        </motion.div>
      </div>

      {/* Floating Invisible Layer / Header */}
      <header className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
        {/* Brand & Countdown */}
        <div className="pointer-events-auto flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-2xl shadow-2xl">
          <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.8 }} className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 grid place-items-center shadow-[0_0_20px_rgba(124,58,237,0.6)]">
            <Orbit className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-tighter text-xs bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Github AI Web Forge
              </span>
              <span className="text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 font-mono">24h</span>
            </div>
            <div className="text-[9px] text-zinc-400 font-mono">
              Rotation in <span className="text-emerald-400 font-semibold">{timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Floating Instrument Toggle & Navigation */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowDock(v => !v)}
            className="p-2.5 rounded-2xl bg-black/60 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-2xl shadow-2xl transition"
            title={showDock ? "Hide Instrument Dock" : "Show Instrument Dock"}
          >
            <Sliders className="w-4 h-4" />
          </button>

          <nav className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-2xl p-1.5 backdrop-blur-2xl shadow-2xl">
            <button
              onClick={() => { setMode('explore'); setShowDock(true); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${mode === 'explore' ? 'bg-white/20 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Compass className="w-3 h-3 text-violet-400" />
              <span>Instrument</span>
            </button>
            <button
              onClick={() => { setMode('hub'); setShowDock(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${mode === 'hub' ? 'bg-white/20 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Grid className="w-3 h-3 text-cyan-400" />
              <span>Hub</span>
            </button>
            <button
              onClick={() => { setMode('edit'); setShowDock(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${mode === 'edit' ? 'bg-white/20 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Edit3 className="w-3 h-3 text-fuchsia-400" />
              <span>Content Wizard</span>
            </button>
            <button
              onClick={() => { setMode('forge'); setShowDock(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${mode === 'forge' ? 'bg-white/20 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Code className="w-3 h-3 text-emerald-400" />
              <span>Forge</span>
            </button>
            <button
              onClick={() => { setMode('publish'); setShowDock(false); setPubStep('idle'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${mode === 'publish' ? 'bg-white/20 text-white shadow' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Send className="w-3 h-3 text-amber-400" />
              <span>Publish</span>
            </button>
            <button
              onClick={() => { setMode('settings'); setShowDock(false); }}
              className={`p-2 rounded-xl transition ${mode === 'settings' ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Floating Bottom Instrument Dock (Sliders for Content & Layout) */}
      <AnimatePresence>
        {showDock && mode === 'explore' && (
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
        )}
      </AnimatePresence>

      {/* Floating Center Modals for Hub, Content Wizard, Forge, Publish, Settings */}
      <main className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {mode === 'hub' && (
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
                  {projects.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/50 transition">
                      <div className="text-[10px] font-mono text-zinc-500 mb-1">{p.slug}</div>
                      <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                      <p className="text-xs text-zinc-400 mb-3">{p.intro}</p>
                      <button onClick={() => { setProjectId(p.id); setMode('explore'); setShowDock(true); setSparkKey(k => k + 1); }} className="px-3 py-1.5 rounded-xl text-[10px] bg-violet-600/30 text-violet-200 font-mono">Load →</button>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-fuchsia-400 font-bold">Universes</h3>
                  {layouts.map(l => (
                    <div key={l.meta.id} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-fuchsia-500/50 transition">
                      <div className="text-[10px] font-mono text-zinc-500 mb-1">v{l.meta.version}</div>
                      <h4 className="font-bold text-sm mb-1">{l.meta.name}</h4>
                      <p className="text-xs text-zinc-400 mb-3">{l.meta.description || 'Custom universe.'}</p>
                      <button onClick={() => { setLayoutId(l.meta.id); setMode('explore'); setShowDock(true); setSparkKey(k => k + 1); }} className="px-3 py-1.5 rounded-xl text-[10px] bg-fuchsia-600/30 text-fuchsia-200 font-mono">Enter →</button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto w-full max-w-xl bg-black/90 border border-white/20 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl space-y-6"
            >
              {/* Wizard Header & Progress */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold">Content Wizard</h2>
                  <p className="text-[11px] text-zinc-400 font-mono">Step {wizardStep} of {totalWizardSteps} · Crafting Content</p>
                </div>
                <button onClick={() => { setMode('explore'); setShowDock(true); }} className="px-3 py-1.5 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition">Exit</button>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  animate={{ width: `${(wizardStep / totalWizardSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Wizard Step Content */}
              <div className="space-y-4 min-h-[200px]">
                {wizardStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 1: Content Identity</label>
                    <p className="text-xs text-zinc-400">Give your content a title and unique identifier slug.</p>
                    <input
                      type="text"
                      placeholder="Title (e.g. Abyssal Echo)"
                      value={projectDraft.title}
                      onChange={e => setProjectDraft({ ...projectDraft, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="Slug (e.g. ocean)"
                      value={projectDraft.slug}
                      onChange={e => setProjectDraft({ ...projectDraft, slug: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono"
                    />
                  </motion.div>
                )}

                {wizardStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 2: Intro Memory</label>
                    <p className="text-xs text-zinc-400">Write your opening statement in Markdown format.</p>
                    <textarea
                      rows={5}
                      placeholder="# Intro (Markdown supported)..."
                      value={projectDraft.intro}
                      onChange={e => setProjectDraft({ ...projectDraft, intro: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </motion.div>
                )}

                {wizardStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 3: Core Story</label>
                    <p className="text-xs text-zinc-400">Elaborate the narrative using Markdown headings, lists, and emphasis.</p>
                    <textarea
                      rows={5}
                      placeholder="Story narrative in Markdown..."
                      value={projectDraft.story}
                      onChange={e => setProjectDraft({ ...projectDraft, story: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </motion.div>
                )}

                {wizardStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 4: Ideas & Telemetry</label>
                    <p className="text-xs text-zinc-400">List core concepts or data points in Markdown format.</p>
                    <textarea
                      rows={5}
                      placeholder="Ideas / concepts..."
                      value={projectDraft.ideas}
                      onChange={e => setProjectDraft({ ...projectDraft, ideas: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </motion.div>
                )}

                {wizardStep === 5 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 5: Media Signal</label>
                    <p className="text-xs text-zinc-400">Provide an image link in Markdown format <code className="text-cyan-400">![alt](url)</code>.</p>
                    <textarea
                      rows={3}
                      placeholder="![Image](https://images.unsplash.com/...)"
                      value={projectDraft.media}
                      onChange={e => setProjectDraft({ ...projectDraft, media: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </motion.div>
                )}

                {wizardStep === 6 && (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                    <label className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold block">Step 6: Closing Resonance</label>
                    <p className="text-xs text-zinc-400">Write the final takeaway memory in Markdown.</p>
                    <textarea
                      rows={4}
                      placeholder="Closing remarks..."
                      value={projectDraft.closing}
                      onChange={e => setProjectDraft({ ...projectDraft, closing: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-sm outline-none focus:border-violet-500 font-mono resize-none"
                    />
                  </motion.div>
                )}
              </div>

              {/* Wizard Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  disabled={wizardStep === 1}
                  onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                  className="px-4 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/15 transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                {wizardStep < totalWizardSteps ? (
                  <button
                    onClick={() => setWizardStep(s => Math.min(totalWizardSteps, s + 1))}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg flex items-center gap-1.5"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => { handleSaveProject(); setShowDock(true); }}
                    className="px-6 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save & Manifest
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {mode === 'forge' && (
            <motion.div
              key="forge"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto absolute top-20 right-6 w-96 bg-black/85 border border-white/20 rounded-3xl p-6 backdrop-blur-3xl shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="text-sm font-bold text-cyan-400 font-mono">Universe Forge Live</h2>
                <div className="flex gap-2">
                  <button onClick={() => { setMode('explore'); setShowDock(true); }} className="px-3 py-1 rounded-lg text-xs bg-white/10">Close</button>
                  <button onClick={handleCreateLayout} className="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white">Save</button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">Universe Name</label>
                  <input
                    type="text"
                    value={forgeName}
                    onChange={e => setForgeName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">HTML Structure</label>
                  <textarea
                    rows={6}
                    value={forgeHtml}
                    onChange={e => setForgeHtml(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-cyan-300 resize-none outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-zinc-400 block mb-1">CSS Styling</label>
                  <textarea
                    rows={6}
                    value={forgeCss}
                    onChange={e => setForgeCss(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-[11px] text-fuchsia-300 resize-none outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'publish' && (
            <motion.div
              key="publish"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto max-w-md w-full bg-black/90 border border-white/20 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 grid place-items-center shadow-lg">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">GitHub Publishing</h2>
                    <p className="text-[11px] text-zinc-400 font-mono">App: gh-ai-website (@EnzoVezzaro)</p>
                  </div>
                </div>
                <button onClick={() => { setMode('explore'); setShowDock(true); setPubStep('idle'); }} className="px-3 py-1 rounded-lg text-xs bg-white/10">Close</button>
              </div>

              {pubStep === 'idle' && (
                <div className="space-y-4 text-center py-4">
                  <p className="text-xs text-zinc-300">
                    Publish your content & universe via GitHub App (Branch + Commit + PR + CI Auto-Merge).
                  </p>
                  <button
                    onClick={startPublishing}
                    className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Start Live Publishing
                  </button>
                </div>
              )}

              {pubStep !== 'idle' && pubStep !== 'success' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="text-amber-400 font-bold mb-2">Publishing via GitHub App...</div>
                  <div className={`flex items-center gap-2.5 ${pubStep === 'preparing' ? 'text-amber-300 animate-pulse' : 'text-emerald-400'}`}>
                    <span>{pubStep === 'preparing' ? '●' : '✓'}</span>
                    <span>Preparing project structure & Markdown files</span>
                  </div>
                  <div className={`flex items-center gap-2.5 ${pubStep === 'sending' ? 'text-amber-300 animate-pulse' : ['pr', 'checks', 'publishing'].includes(pubStep) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>{pubStep === 'sending' ? '●' : ['pr', 'checks', 'publishing'].includes(pubStep) ? '✓' : '○'}</span>
                    <span>Sending to GitHub App (gh-ai-website)</span>
                  </div>
                  <div className={`flex items-center gap-2.5 ${pubStep === 'pr' ? 'text-amber-300 animate-pulse' : ['checks', 'publishing'].includes(pubStep) ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>{pubStep === 'pr' ? '●' : ['checks', 'publishing'].includes(pubStep) ? '✓' : '○'}</span>
                    <span>Creating Pull Request (Branch + Commit)</span>
                  </div>
                  <div className={`flex items-center gap-2.5 ${pubStep === 'checks' ? 'text-amber-300 animate-pulse' : pubStep === 'publishing' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <span>{pubStep === 'checks' ? '●' : pubStep === 'publishing' ? '✓' : '○'}</span>
                    <span>Running CI validation & schema checks</span>
                  </div>
                  <div className={`flex items-center gap-2.5 ${pubStep === 'publishing' ? 'text-amber-300 animate-pulse' : 'text-zinc-500'}`}>
                    <span>{pubStep === 'publishing' ? '●' : '○'}</span>
                    <span>Auto-merging & publishing live</span>
                  </div>
                </div>
              )}

              {pubStep === 'success' && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto grid place-items-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">✓ Published</h3>
                    <p className="text-xs text-zinc-400">Your project is now live on the shared Random Web.</p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => { setMode('explore'); setShowDock(true); setPubStep('idle'); }}
                      className="px-4 py-2 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View website
                    </button>
                    <a
                      href="https://github.com/EnzoVezzaro/github-ai-websites/pulls"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow flex items-center gap-1.5"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" /> View on GitHub
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {mode === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="pointer-events-auto max-w-sm w-full space-y-4 bg-black/90 border border-white/20 rounded-3xl p-6 backdrop-blur-3xl shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="font-semibold">Studio Infrastructure</h2>
                <button onClick={() => { setMode('explore'); setShowDock(true); }} className="text-zinc-400">Close</button>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-emerald-400">
                <span>● GitHub App [gh-ai-website]</span>
                <span className="text-zinc-500">Connected</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
