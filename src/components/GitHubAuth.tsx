import { useEffect, useState } from 'react';
import { lsGet, lsSet, lsRemove, Keys } from '../lib/storage';
import { motion } from 'framer-motion';
import { GitBranch } from 'lucide-react';
import { loginWithGitHub } from '../lib/github';

export function GitHubAuth() {
  const [clientId, setClientId] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setSavedId(lsGet<string>(Keys.githubClientId) || '');
    setUser(lsGet(Keys.githubUser));
  }, []);

  const saveClientId = () => {
    if (clientId) {
      lsSet(Keys.githubClientId, clientId);
      setSavedId(clientId);
    }
  };

  const login = () => {
    const id = savedId || clientId;
    if (!id) return alert('Set GitHub OAuth Client ID first');
    loginWithGitHub(id);
  };

  const logout = () => {
    lsRemove(Keys.githubToken);
    lsRemove(Keys.githubUser);
    setUser(null);
  };

  if (user) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
        <img src={user.avatar_url} className="w-8 h-8 rounded-full" alt="" />
        <span className="text-sm">{user.login}</span>
        <button onClick={logout} className="text-xs underline">Logout</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
      <h3 className="font-medium mb-2 flex items-center gap-2">
        <GitBranch className="w-4 h-4" /> GitHub Login
      </h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
        All keys are stored in localStorage for local-only demo. Never use in production.
      </p>
      <input
        placeholder="GitHub OAuth Client ID"
        value={clientId}
        onChange={e => setClientId(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-zinc-800"
      />
      <div className="flex gap-2 mt-3">
        <button onClick={saveClientId} className="btn">Save</button>
        <button onClick={login} className="btn bg-zinc-900 text-white dark:bg-white dark:text-black">Login</button>
      </div>
      {savedId && <p className="text-xs mt-2 text-zinc-500">Saved client ID: {savedId.slice(0,8)}…</p>}
    </motion.div>
  );
}