import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { Studio } from './Studio';
import { loginWithGitHub } from '../lib/github';
import { Orbit, CheckCircle2, ShieldCheck, Key, GitBranch, Sparkles } from 'lucide-react';

export function StartupGate() {
  const { settings, update } = useSettings();
  const [phase, setPhase] = useState<'checking' | 'prompt' | 'ready'>('checking');

  const [aiApiKey, setAiApiKey] = useState(settings.aiApiKey || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const hasCreds = !!(settings.githubToken || settings.githubClientId || settings.aiApiKey);
      if (hasCreds) {
        setPhase('ready');
      } else {
        setPhase('prompt');
      }
    }, 1400);
    return () => clearTimeout(timeout);
  }, [settings]);

  const handleSaveAndEnter = () => {
    update({ aiApiKey });
    setPhase('ready');
  };

  const handleGitHubLogin = () => {
    const clientId = settings.githubClientId || 'Iv23liLdgd3ES0Fs7Xh0';
    loginWithGitHub(clientId);
  };

  const handleSkip = () => {
    setPhase('ready');
  };

  if (phase === 'checking') {
    return (
      <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center max-w-md p-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mx-auto grid place-items-center shadow-[0_0_30px_rgba(124,58,237,0.5)]">
            <Orbit className="w-7 h-7 text-white animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight mb-1">Github AI Web Forge</h1>
            <p className="text-xs text-zinc-400">Verifying studio environment & connections...</p>
          </div>
          <div className="space-y-2 text-xs text-left bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checking 24-hour cycle node...</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verifying GitHub App [gh-ai-website]...</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span>Validating AI credentials...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'prompt') {
    return (
      <div className="h-screen w-screen bg-black/90 text-white flex items-center justify-center p-6 relative font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg bg-zinc-900/90 border border-white/15 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 grid place-items-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Studio Credentials Check</h2>
              <p className="text-xs text-zinc-400">Connect GitHub App <code className="text-violet-400">gh-ai-website</code> for synchronization.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-zinc-300">GitHub App: gh-ai-website</span>
                <span className="text-[10px] font-mono text-emerald-400">Client ID Configured</span>
              </div>
              <button
                onClick={handleGitHubLogin}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition flex items-center justify-center gap-2"
              >
                <GitBranch className="w-4 h-4" /> Authorize with GitHub OAuth
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="uppercase font-mono text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-fuchsia-400" /> AI Provider API Key (Optional)
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={aiApiKey}
                onChange={e => setAiApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 outline-none focus:border-fuchsia-500 text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button onClick={handleSkip} className="text-xs text-zinc-400 hover:text-white transition">
              Skip for Now (Local Demo)
            </button>
            <button
              onClick={handleSaveAndEnter}
              className="px-6 py-2.5 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Save & Enter Studio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <Studio />;
}
