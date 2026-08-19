import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, GitBranch, ArrowRight, CheckCircle2, Zap, Globe } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const steps = [
  { id: 'welcome', title: 'Welcome to Github AI Web Forge', desc: 'Content + Layout = Website. Let’s set up your studio.', icon: Globe },
  { id: 'github', title: 'Connect GitHub', desc: 'Load projects & layouts from your repo. Keys stay local.', icon: GitBranch },
  { id: 'ai', title: 'Pick an AI provider', desc: 'Optional AI suggestions for content. Keys stay local.', icon: Sparkles },
  { id: 'done', title: 'Ready to explore', desc: 'Instant preview, edit mode, and delightful motion.', icon: Zap },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { settings, update } = useSettings();
  const [step, setStep] = useState(0);
  const [githubPat, setGithubPat] = useState(settings.githubToken || '');
  const [aiProvider, setAiProvider] = useState<'openai-compatible' | 'local'>(
    (settings.aiProvider as any) || 'openai-compatible'
  );
  const [aiApiKey, setAiApiKey] = useState(settings.aiApiKey || '');
  const [aiBaseUrl, setAiBaseUrl] = useState('');

  const progress = step / (steps.length - 1);

  const next = () => {
    if (step === 1) update({ githubToken: githubPat });
    if (step === 2) update({ aiProvider, aiApiKey, aiBaseUrl });
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      if (step === steps.length - 2) setTimeout(onDone, 800);
    }
  };

  const Icon = steps[step].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">R</div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Github AI Web Forge</h1>
            <p className="text-sm text-zinc-500">Setup your studio</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress*100}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="h-full bg-violet-600" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
                <Icon className="w-5 h-5"/>
              </div>
              <h2 className="text-xl font-semibold">{steps[step].title}</h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{steps[step].desc}</p>

            {step === 0 && (
              <div className="grid grid-cols-3 gap-3">
                {['Instant preview','Edit mode','AI assist'].map(t => (
                  <motion.div key={t} whileHover={{ y: -2 }} className="rounded-2xl border p-4 text-center text-sm bg-zinc-50 dark:bg-zinc-900/50">
                    {t}
                  </motion.div>
                ))}
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">GitHub Personal Access Token</label>
                <input value={githubPat} onChange={e => setGithubPat(e.target.value)} type="password" placeholder="ghp_..." className="select" />
                <p className="text-xs text-zinc-500">Read-only scope is enough. Never leaves your browser.</p>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Provider</label>
                <select value={aiProvider} onChange={e => setAiProvider(e.target.value as any)} className="select">
                  <option value="openai-compatible">OpenAI Compatible</option>
                  <option value="local">Compatible Local Model</option>
                </select>
                <label className="text-sm font-medium">API Key</label>
                <input value={aiApiKey} onChange={e => setAiApiKey(e.target.value)} type="password" placeholder={aiProvider === 'local' ? 'optional for local' : 'sk-...'} className="select" />
                <input value={aiBaseUrl} onChange={e => setAiBaseUrl(e.target.value)} placeholder={aiProvider === 'local' ? 'http://localhost:11434/v1' : 'https://…/v1'} className="select" />
              </div>
            )}
            {step === 3 && (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
                  <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500" />
                </motion.div>
                <p className="text-zinc-600 dark:text-zinc-400 mt-4">All set. Enjoy the playground.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(s => Math.max(0, s-1))} className="text-sm text-zinc-600">Back</button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={next} disabled={!(step === 0 || (step === 1 && githubPat.length > 0) || step > 1)} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
            {step === steps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
