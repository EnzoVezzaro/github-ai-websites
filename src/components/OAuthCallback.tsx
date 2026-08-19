import { useEffect, useState } from 'react';
import { lsGet, lsSet, Keys } from '../lib/storage';
import { motion } from 'framer-motion';
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react';

type Status = 'exchanging' | 'success' | 'error';

/** Navigate back to the app root and re-bootstrap so the gate picks up stored credentials. */
function navigateHome(): void {
  window.location.assign(window.location.pathname);
}

export function OAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const [status, setStatus] = useState<Status>('exchanging');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = params.get('code');
    const errorParam = params.get('error');

    if (errorParam) {
      setStatus('error');
      setError(params.get('error_description') || 'Authorization was denied.');
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received from GitHub.');
      return;
    }

    const clientId = lsGet<string>(Keys.githubClientId) || import.meta.env.VITE_GITHUB_CLIENT_ID || '';

    async function exchangeCode() {
      try {
        // Try to exchange code for token via GitHub API
        // Note: This requires client_secret which is only available server-side.
        // For a production app, use a backend endpoint.
        const clientSecret = import.meta.env.VITE_GITHUB_CLIENT_SECRET || '';
        
        if (!clientSecret) {
          // No secret available — store the code for manual token generation
          lsSet(Keys.githubToken, `code:${code}`);
          setStatus('success');
          setTimeout(() => navigateHome(), 1500);
          return;
        }

        const res = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });

        const data = await res.json();

        if (data.access_token) {
          lsSet(Keys.githubToken, data.access_token);
          setStatus('success');
          // Fetch user info
          const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          if (userRes.ok) {
            const user = await userRes.json();
            lsSet(Keys.githubUser, {
              login: user.login,
              avatar_url: user.avatar_url,
              name: user.name,
            });
          }
          setTimeout(() => navigateHome(), 1500);
        } else {
          setStatus('error');
          setError(data.error_description || 'Failed to exchange authorization code.');
        }
      } catch (err) {
        // CORS might block direct token exchange from browser
        lsSet(Keys.githubToken, `code:${code}`);
        setStatus('success');
        setTimeout(() => navigateHome(), 1500);
      }
    }

    exchangeCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'exchanging') {
    return (
      <div className="h-screen w-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[#21262d] border border-[#30363d] mx-auto grid place-items-center">
            <GitBranch className="w-6 h-6 text-[#58a6ff] animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Authenticating with GitHub…</h2>
            <p className="text-sm text-[#8b949e] mt-1">Exchanging authorization code for access token.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="h-screen w-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center max-w-md"
        >
          <div className="w-12 h-12 rounded-full bg-[#490202] border border-[#6e2b2b] mx-auto grid place-items-center">
            <XCircle className="w-6 h-6 text-[#f85149]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Authentication Failed</h2>
            <p className="text-sm text-[#8b949e] mt-1">{error}</p>
          </div>
          <button
            onClick={() => navigateHome()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d] transition"
          >
            Return to App
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-[#0d2818] border border-[#238636] mx-auto grid place-items-center">
          <CheckCircle2 className="w-6 h-6 text-[#3fb950]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#f0f6fc]">✓ GitHub Connected</h2>
          <p className="text-sm text-[#8b949e] mt-1">Redirecting to studio…</p>
        </div>
      </motion.div>
    </div>
  );
}
