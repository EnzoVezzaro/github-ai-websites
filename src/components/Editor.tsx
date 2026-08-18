import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ProjectContent } from '../types';
import { suggestContent } from '../lib/ai';
import { lsGet, Keys } from '../lib/storage';
import { Sparkles } from 'lucide-react';

export function Editor({ project, onChange }: { project: ProjectContent; onChange: (p: ProjectContent) => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const fields: (keyof ProjectContent)[] = ['intro', 'story', 'ideas', 'media', 'closing'];

  const handleSuggest = async (field: keyof ProjectContent) => {
    const apiKey = lsGet<string>(Keys.aiApiKey);
    if (!apiKey) return alert('Set AI API key in settings first (localStorage)');
    setLoading(field);
    try {
      const text = await suggestContent(project[field] as string, field);
      onChange({ ...project, [field]: text });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {fields.map(f => (
        <motion.div key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-3 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-zinc-500">{f}</label>
            <button onClick={() => handleSuggest(f)} disabled={!!loading} className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs">
              <Sparkles className="w-3 h-3" /> {loading === f ? '...' : 'AI suggest'}
            </button>
          </div>
          <textarea
            value={project[f] as string}
            onChange={e => onChange({ ...project, [f]: e.target.value })}
            className="w-full h-32 p-2 text-sm border rounded-lg bg-transparent outline-none"
            placeholder="Start writing..."
          />
        </motion.div>
      ))}
    </div>
  );
}