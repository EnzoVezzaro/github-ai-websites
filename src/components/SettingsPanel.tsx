import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { usePlugins } from '../plugins';
import { builtInThemes, loadCustomThemes, addCustomTheme, removeCustomTheme } from '../themes';
import { useSpatialStore } from '../store/spatialStore';
import { generateThemeWithAI } from '../lib/ai';
import { loginWithGitHub, logoutGitHub, fetchGitHubUser } from '../lib/github';
import { AIProviderFlow } from './AIProviderFlow';
import {
  Key, GitBranch, Bot, Palette, Plug, LogOut, Loader2, Wand2, Check, X, ChevronRight, Keyboard,
} from 'lucide-react';
import { useShortcuts, type ShortcutAction } from '../lib/shortcuts';

const AGENT_SKILLS = [
  'text-layout',
  'color-theory',
  'typography',
  'spatial-composition',
  'zone-structure',
  'media-embed',
];

const inputCls =
  'w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs outline-none focus:border-violet-500 font-mono text-zinc-200';

const tabCls = (active: boolean) =>
  `px-3 py-1.5 rounded-xl text-[11px] font-mono transition flex items-center gap-1.5 ${active ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`;

type Tab = 'ai' | 'github' | 'agent' | 'themes' | 'plugins' | 'shortcuts';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { plugins, isEnabled, toggle } = usePlugins();
  const activeThemeId = useSpatialStore(s => s.activeThemeId);

  const [tab, setTab] = useState<Tab>('ai');

  return (
    <div className="pointer-events-auto w-full max-w-lg max-h-[84vh] flex flex-col bg-black/90 border border-white/20 rounded-3xl backdrop-blur-3xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <h2 className="text-base font-bold">Studio Infrastructure</h2>
          <p className="text-[10px] text-zinc-500 font-mono">Configurations, connections & plugins</p>
        </div>
        <button onClick={onClose} className="px-3 py-1.5 rounded-xl text-xs bg-white/10 hover:bg-white/20 transition font-mono">Close</button>
      </div>

      <div className="flex items-center gap-1 px-6 pt-4 flex-shrink-0 border-b border-white/5 pb-3">
        <button className={tabCls(tab === 'ai')} onClick={() => setTab('ai')}><Key className="w-3 h-3" /> AI</button>
        <button className={tabCls(tab === 'github')} onClick={() => setTab('github')}><GitBranch className="w-3 h-3" /> GitHub</button>
        <button className={tabCls(tab === 'agent')} onClick={() => setTab('agent')}><Bot className="w-3 h-3" /> Agent</button>
        <button className={tabCls(tab === 'themes')} onClick={() => setTab('themes')}><Palette className="w-3 h-3" /> Themes</button>
        <button className={tabCls(tab === 'plugins')} onClick={() => setTab('plugins')}><Plug className="w-3 h-3" /> Plugins</button>
        <button className={tabCls(tab === 'shortcuts')} onClick={() => setTab('shortcuts')}><Keyboard className="w-3 h-3" /> Keys</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
        {tab === 'ai' && <AiTab />}
        {tab === 'github' && <GithubTab />}
        {tab === 'agent' && <AgentTab />}
        {tab === 'themes' && <ThemesTab activeThemeId={activeThemeId} />}
        {tab === 'plugins' && <PluginsTab plugins={plugins} isEnabled={isEnabled} toggle={toggle} />}
        {tab === 'shortcuts' && <ShortcutsTab />}
      </div>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-violet-400 font-mono text-[10px] uppercase tracking-widest mb-2">
      {icon} {label}
    </div>
  );
}

function AiTab() {
  return (
    <div className="space-y-5">
      <SectionTitle icon={<Key className="w-3.5 h-3.5" />} label="AI Provider" />
      <AIProviderFlow />
    </div>
  );
}

function GithubTab() {
  const { settings, update } = useSettings();
  const [githubToken, setGithubToken] = useState('');
  const [clientId, setClientId] = useState(settings.githubClientId || '');

  const handleLogin = () => {
    const id = clientId || settings.githubClientId || 'Iv23liLdgd3ES0Fs7Xh0';
    update({ githubClientId: id });
    loginWithGitHub(id);
  };

  const handleLogout = () => {
    logoutGitHub();
    update({ githubToken: '', githubUser: undefined });
  };

  const handleSaveToken = async () => {
    if (!githubToken.trim()) return;
    update({ githubToken: githubToken.trim() });
    const user = await fetchGitHubUser(githubToken.trim());
    if (user) update({ githubUser: user });
    setGithubToken('');
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={<GitBranch className="w-3.5 h-3.5" />} label="GitHub" />
      <input
        className={inputCls}
        placeholder="OAuth Client ID"
        value={clientId}
        onChange={e => setClientId(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={() => update({ githubClientId: clientId })} className="px-3 py-2 rounded-xl text-[10px] bg-white/10 hover:bg-white/20 font-mono">Save ID</button>
        <button onClick={handleLogin} className="px-3 py-2 rounded-xl text-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-mono">Authorize OAuth</button>
      </div>
      {settings.githubUser ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <img src={settings.githubUser.avatar_url} className="w-7 h-7 rounded-full" alt="" />
          <span className="text-xs text-zinc-200 flex-1">{settings.githubUser.login}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-[10px] text-red-400 font-mono"><LogOut className="w-3 h-3" /> Logout</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="PAT or access token"
            type="password"
            value={githubToken}
            onChange={e => setGithubToken(e.target.value)}
          />
          <button onClick={handleSaveToken} className="px-3 py-2 rounded-xl text-[10px] bg-white/10 hover:bg-white/20 font-mono flex-shrink-0">Save</button>
        </div>
      )}
      {settings.githubToken && !settings.githubUser && (
        <div className="text-[10px] text-emerald-400 font-mono">✓ Token stored locally</div>
      )}
    </div>
  );
}

function AgentTab() {
  const { settings, update } = useSettings();
  const [systemPrompt, setSystemPrompt] = useState(settings.agent?.systemPrompt || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(settings.agent?.selectedSkills || []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    update({ agent: { systemPrompt, selectedSkills } });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={<Bot className="w-3.5 h-3.5" />} label="Agent" />
      <textarea
        className={`${inputCls} resize-none h-24`}
        placeholder="System prompt for the AI agent…"
        value={systemPrompt}
        onChange={e => setSystemPrompt(e.target.value)}
      />
      <div>
        <div className="text-[10px] text-zinc-500 font-mono mb-1.5">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {AGENT_SKILLS.map(skill => {
            const active = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => setSelectedSkills(prev => active ? prev.filter(s => s !== skill) : [...prev, skill])}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition ${active ? 'bg-fuchsia-600/30 border-fuchsia-500/50 text-fuchsia-200' : 'bg-white/5 border-white/10 text-zinc-400'}`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={handleSave}
        className={`px-4 py-2 rounded-xl text-[11px] font-mono transition flex items-center gap-1.5 ${saved ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 hover:bg-white/20'}`}
      >
        {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Agent Config'}
      </button>
    </div>
  );
}

function ThemesTab({ activeThemeId }: { activeThemeId: string }) {
  const { settings } = useSettings();
  const setActiveTheme = useSpatialStore(s => s.setActiveTheme);
  const [custom, setCustom] = useState(() => loadCustomThemes().map(t => ({ theme: t, id: `ai-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` })));
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCustom = () => {
    const list = loadCustomThemes().map(t => ({ theme: t, id: `ai-${t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` }));
    setCustom(list);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!settings.aiApiKey) {
      setError('Configure your AI provider (API key) first.');
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const generated = await generateThemeWithAI(prompt.trim());
      const behavior = addCustomTheme(generated);
      setActiveTheme(behavior.id);
      setPrompt('');
      refreshCustom();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Palette className="w-3.5 h-3.5" />} label="Spatial Themes" />

      {/* Default themes */}
      <div>
        <div className="text-[10px] text-zinc-500 font-mono mb-2">Default themes</div>
        <div className="grid grid-cols-1 gap-1.5">
          {builtInThemes.map(theme => {
            const selected = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition ${selected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/25'}`}
              >
                <span className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: theme.visuals.cardBackground, border: `1px solid ${theme.visuals.cardBorder}`, boxShadow: theme.visuals.glow ? `0 0 12px ${theme.visuals.glow}` : undefined }} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[11px] font-semibold text-zinc-200 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: theme.visuals.accent }} />
                    {theme.name}
                  </span>
                  <span className="block text-[9px] text-zinc-500 truncate mt-0.5">{theme.description}</span>
                </span>
                {selected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI theme generator */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-fuchsia-400 font-mono text-[10px] uppercase tracking-widest mb-2">
          <Wand2 className="w-3.5 h-3.5" /> Create theme with AI
        </div>
        <div className="flex gap-2">
          <input
            className={inputCls}
            placeholder="A website URL or mood… e.g. synthwave sunset, brutalist concrete"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className={`mt-2 px-4 py-2 rounded-xl text-[11px] font-mono transition flex items-center gap-1.5 ${generating || !prompt.trim() ? 'bg-white/10 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white'}`}
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          {generating ? 'Generating…' : 'Generate with AI'}
        </button>
        {error && <div className="text-[10px] text-red-400 mt-1.5 font-mono">{error}</div>}
        {!settings.aiApiKey && (
          <div className="text-[9px] text-zinc-500 mt-1.5">Set an AI API key in the AI tab to use the generator.</div>
        )}
      </div>

      {/* AI-generated themes */}
      {custom.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="text-[10px] text-zinc-500 font-mono mb-2">AI themes ({custom.length})</div>
          <div className="grid grid-cols-1 gap-1.5">
            {custom.map(c => {
              const selected = activeThemeId === c.id;
              return (
                <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${selected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10'}`}>
                  <span className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: c.theme.cardBackground, border: `1px solid ${c.theme.cardBorder}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-zinc-200 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: c.theme.accent }} />
                      {c.theme.name}
                    </div>
                    {c.theme.description && <div className="text-[9px] text-zinc-500 truncate mt-0.5">{c.theme.description}</div>}
                  </div>
                  <button
                    onClick={() => setActiveTheme(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono ${selected ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/10 hover:bg-white/20 text-zinc-300'}`}
                  >
                    {selected ? 'Active' : 'Apply'}
                  </button>
                  <button
                    onClick={() => { removeCustomTheme(c.id); refreshCustom(); }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete theme"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PluginsTab({ plugins, isEnabled, toggle }: {
  plugins: ReturnType<typeof usePlugins>['plugins'];
  isEnabled: (id: string) => boolean;
  toggle: (id: string) => void;
}) {
  const categories: Array<PluginCategory> = ['core', 'editing', 'collaboration', 'layout', 'publishing'];
  const categoryLabel: Record<string, string> = {
    core: 'Core',
    editing: 'Editing',
    collaboration: 'Collaboration',
    layout: 'Layout',
    publishing: 'Publishing',
  };

  const enabledWithSections = plugins.filter(p => isEnabled(p.id) && p.SettingsSection && p.id !== 'spatial-themes');

  return (
    <div className="space-y-5">
      <SectionTitle icon={<Plug className="w-3.5 h-3.5" />} label="Plugins" />
      <p className="text-[10px] text-zinc-500 -mt-2">
        Toggle features on and off. Disabled plugins hide their controls from the studio.
      </p>

      {categories.map(cat => {
        const catPlugins = plugins.filter(p => p.category === cat);
        if (!catPlugins.length) return null;
        return (
          <div key={cat}>
            <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1.5">{categoryLabel[cat]}</div>
            <div className="space-y-1">
              {catPlugins.map(p => {
                const enabled = isEnabled(p.id);
                const locked = !!p.locked;
                return (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10">
                    <button
                      onClick={() => !locked && toggle(p.id)}
                      className={`relative rounded-full transition flex-shrink-0 ${enabled ? 'bg-cyan-500/70' : 'bg-white/10'} ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ width: 28, height: 18 }}
                      aria-label={`Toggle ${p.name}`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${enabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-zinc-200 flex items-center gap-1.5">
                        {p.name}
                        {locked && <span className="text-[8px] font-mono text-zinc-500 border border-white/10 rounded px-1">locked</span>}
                      </div>
                      <div className="text-[9px] text-zinc-500 truncate">{p.description}</div>
                    </div>
                    <span className={`text-[9px] font-mono ${enabled ? 'text-emerald-400' : 'text-zinc-500'}`}>{enabled ? 'on' : 'off'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {enabledWithSections.length > 0 && (
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            <ChevronRight className="w-3 h-3" /> Plugin settings
          </div>
          {enabledWithSections.map(p => {
            const Section = p.SettingsSection!;
            return <div key={p.id}><Section /></div>;
          })}
        </div>
      )}
    </div>
  );
}

type PluginCategory = 'core' | 'editing' | 'collaboration' | 'layout' | 'publishing';

function ShortcutsTab() {
  const { bindings, setKey } = useShortcuts();
  const [editing, setEditing] = useState<ShortcutAction | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const captureKey = (e: React.KeyboardEvent, action: ShortcutAction) => {
    e.preventDefault();
    const key = e.key;
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return;
    const normalized = key.length === 1 ? key.toLowerCase() : key;
    if (!setKey(action, normalized)) {
      setError('Key already in use by another action.');
      return;
    }
    setError(null);
    setEditing(null);
    setDraft('');
  };

  return (
    <div className="space-y-4">
      <SectionTitle icon={<Keyboard className="w-3.5 h-3.5" />} label="Keyboard Shortcuts" />
      <p className="text-[10px] text-zinc-500 -mt-2">
        Each control-panel action has a key. Click one to press a new key on your keyboard.
      </p>

      <div className="space-y-1.5">
        {bindings.map(b => (
          <div key={b.action} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-zinc-200">{b.label}</span>
            {editing === b.action ? (
              <input
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => captureKey(e, b.action)}
                onBlur={() => { setEditing(null); setError(null); }}
                className="w-20 px-2 py-1 rounded-lg bg-white/5 border border-violet-500 text-[11px] font-mono text-center text-violet-300 outline-none"
                placeholder="press a key…"
              />
            ) : (
              <button
                onClick={() => { setEditing(b.action); setDraft(b.key); }}
                className="px-2.5 py-1 rounded-lg text-[10px] font-mono border border-white/15 text-violet-300 hover:border-violet-500"
              >
                {b.key}
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <div className="text-[10px] text-red-400 font-mono">{error}</div>}
      <div className="text-[9px] text-zinc-600 font-mono">Tip: press the key while focused to rebind. Escape / ? are fixed.</div>
    </div>
  );
}
