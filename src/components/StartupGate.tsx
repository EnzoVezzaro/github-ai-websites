import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { Studio } from './Studio';
import { AIProviderFlow } from './AIProviderFlow';
import { loginWithGitHub, logoutGitHub, fetchGitHubUser } from '../lib/github';
import { Orbit, Key, GitBranch, Sparkles, Check, LogOut } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs outline-none focus:border-violet-500 text-zinc-200 font-mono';

export function StartupGate() {
  const { settings, update } = useSettings();
  const [phase, setPhase] = useState<'checking' | 'login' | 'ready'>('checking');

  const [pat, setPat] = useState('');
  const [saving, setSaving] = useState(false);

  const githubOk = !!settings.githubToken;
  const providerOk = settings.aiProvider === 'local' ? true : !!settings.aiApiKey;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhase(githubOk && providerOk ? 'ready' : 'login');
    }, 900);
    return () => clearTimeout(timeout);
  }, [githubOk, providerOk]);

  const handleGitHubOAuth = () => {
    const id = settings.githubClientId || 'Iv23liLdgd3ES0Fs7Xh0';
    update({ githubClientId: id });
    loginWithGitHub(id);
  };

  const handleSavePat = async () => {
    if (!pat.trim()) return;
    setSaving(true);
    update({ githubToken: pat.trim() });
    const user = await fetchGitHubUser(pat.trim());
    if (user) update({ githubUser: user });
    setSaving(false);
    setPat('');
  };

  const handleEnter = () => {
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
            <p className="text-xs text-zinc-400">Verifying studio credentials...</p>
          </div>
          <div className="space-y-2 text-xs text-left bg-white/[0.03] border border-white/10 rounded-2xl p-4">
            <div className={`flex items-center gap-2 ${githubOk ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {githubOk ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
              <span>GitHub account</span>
            </div>
            <div className={`flex items-center gap-2 ${providerOk ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {providerOk ? <Check className="w-3.5 h-3.5" /> : <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
              <span>AI provider</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === 'login') {
    const canEnter = githubOk && providerOk;
    return (
      <div className="h-screen w-screen bg-black/90 text-white flex items-center justify-center p-6 relative font-sans overflow-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.15),transparent_70%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg bg-zinc-900/90 border border-white/15 rounded-3xl p-8 backdrop-blur-3xl shadow-2xl space-y-6"
        >
          <div>
            <h2 className="text-lg font-bold">Studio Credentials</h2>
            <p className="text-xs text-zinc-400">Connect your GitHub account and an AI provider to access the platform.</p>
          </div>

          {/* GitHub */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-zinc-300 text-xs flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" /> GitHub Account
              </span>
              {githubOk && <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>}
            </div>

            {githubOk ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                {settings.githubUser ? (
                  <img src={settings.githubUser.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 grid place-items-center"><Check className="w-4 h-4 text-emerald-400" /></span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                    <Check className="w-3 h-3" /> Logged in as
                  </div>
                  <div className="text-sm text-zinc-200 truncate">{settings.githubUser?.login ?? 'GitHub (token saved)'}</div>
                </div>
                <button
                  onClick={() => { logoutGitHub(); update({ githubToken: '', githubUser: undefined }); }}
                  className="flex items-center gap-1 text-[10px] text-red-400 font-mono flex-shrink-0"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGitHubOAuth}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition flex items-center justify-center gap-2"
                >
                  <GitBranch className="w-4 h-4" /> Authorize with GitHub OAuth
                </button>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono"><span className="flex-1 h-px bg-white/10" /> or use a token <span className="flex-1 h-px bg-white/10" /></div>
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    placeholder="GitHub personal access token"
                    type="password"
                    value={pat}
                    onChange={e => setPat(e.target.value)}
                  />
                  <button
                    onClick={handleSavePat}
                    disabled={saving || !pat.trim()}
                    className="px-4 py-2 rounded-xl text-[10px] font-mono bg-white/10 hover:bg-white/20 disabled:opacity-40 flex-shrink-0"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Provider */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-zinc-300 text-xs flex items-center gap-2">
                <Key className="w-4 h-4 text-fuchsia-400" /> AI Provider
              </span>
              {providerOk && <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
            </div>
            <AIProviderFlow compact />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="text-[10px] text-zinc-500 font-mono">
              {!githubOk && <span>• GitHub account required</span>}
              {!githubOk && !providerOk && <span className="mx-1">/</span>}
              {!providerOk && <span>• AI provider required</span>}
              {canEnter && <span className="text-emerald-400">✓ All credentials ready</span>}
            </div>
            <button
              onClick={handleEnter}
              disabled={!canEnter}
              className={`px-6 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${canEnter ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'bg-white/10 text-zinc-500 cursor-not-allowed'}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Enter Studio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <Studio />;
}
