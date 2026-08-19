import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  LOCAL_DEFAULT_BASE_URL,
  PROVIDER_META,
  loadProviders,
  listModelsForProvider,
  type AIProviderMethod,
} from '../lib/ai';
import { SearchableSelect } from './SearchableSelect';
import { Loader2, Sparkles, Cloud, Server } from 'lucide-react';

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-xs outline-none focus:border-violet-500 text-zinc-200 font-mono';

export function AIProviderFlow({ compact = false }: { compact?: boolean }) {
  const { settings, update } = useSettings();
  const [method, setMethod] = useState<AIProviderMethod>(settings.aiProvider === 'local' ? 'local' : 'providers');
  const [cloudProvider, setCloudProvider] = useState<string>(
    settings.aiProvider === 'local' ? 'openai' : settings.aiProvider
  );
  const [providers, setProviders] = useState<string[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [localBaseUrl, setLocalBaseUrl] = useState(settings.aiBaseUrl || '');
  const [apiKey, setApiKey] = useState(settings.aiApiKey || '');
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCloudRef = useRef<string>(cloudProvider);

  const effectiveBaseUrl = localBaseUrl || LOCAL_DEFAULT_BASE_URL;
  const meta = PROVIDER_META[cloudProvider];
  const needsKey = method === 'local' ? false : (meta?.needsKey ?? true);
  const canLoad = needsKey ? !!apiKey : true;

  // Load the provider list from the AI SDK registry.
  useEffect(() => {
    let cancelled = false;
    setProvidersLoading(true);
    loadProviders()
      .then(list => {
        if (cancelled) return;
        setProviders(list);
        if (list.length && !list.includes(cloudProvider)) {
          const next = list.includes('openai') ? 'openai' : list.includes('openai-compatible') ? 'openai-compatible' : list[0];
          setCloudProvider(next);
          update({ aiProvider: next });
        }
      })
      .finally(() => { if (!cancelled) setProvidersLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (settings.aiProvider && settings.aiProvider !== 'local') {
      lastCloudRef.current = settings.aiProvider;
      setCloudProvider(settings.aiProvider);
    }
  }, [settings.aiProvider]);

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    try {
      if (method === 'local') {
        update({ aiProvider: 'local', aiBaseUrl: effectiveBaseUrl, aiApiKey: apiKey });
        const list = await listModelsForProvider('local', apiKey, effectiveBaseUrl);
        setModels(list);
        setLoaded(true);
        if (list.length && !list.includes(settings.aiModel || '')) update({ aiModel: list[0] });
      } else {
        update({ aiProvider: cloudProvider, aiApiKey: apiKey });
        const list = await listModelsForProvider(cloudProvider, apiKey);
        setModels(list);
        setLoaded(true);
        if (list.length && !list.includes(settings.aiModel || '')) update({ aiModel: list[0] });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const switchMethod = (m: AIProviderMethod) => {
    setMethod(m);
    setLoaded(false);
    setModels([]);
    setError(null);
    if (m === 'local') {
      update({ aiProvider: 'local', aiBaseUrl: effectiveBaseUrl });
    } else {
      const next = lastCloudRef.current;
      setCloudProvider(next);
      update({ aiProvider: next });
    }
  };

  const methodBtn = (m: AIProviderMethod, label: string, desc: string, icon: React.ReactNode) => (
    <button
      onClick={() => switchMethod(m)}
      className={`flex-1 p-2.5 rounded-xl border text-left transition ${method === m ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
        {icon} {label}
      </div>
      <div className="text-[9px] text-zinc-500 mt-0.5">{desc}</div>
    </button>
  );

  const providerOptions = providers.map(id => ({
    id,
    label: PROVIDER_META[id]?.label ?? id,
    description: PROVIDER_META[id]?.baseUrl ?? '',
  }));

  return (
    <div className={`space-y-3 ${compact ? '' : 'space-y-4'}`}>
      <div className="flex gap-2">
        {methodBtn('providers', 'Providers', 'Cloud AI providers', <Cloud className="w-3 h-3" />)}
        {methodBtn('local', 'Local', 'Local model server', <Server className="w-3 h-3" />)}
      </div>

      {method === 'providers' ? (
        <div>
          <div className="text-[10px] text-zinc-500 font-mono mb-1">
            Provider (from AI SDK) {providersLoading && <span className="animate-pulse">loading…</span>}
          </div>
          {providers.length > 0 ? (
            <>
              <SearchableSelect
                options={providerOptions}
                value={cloudProvider}
                onChange={id => {
                  setCloudProvider(id);
                  setLoaded(false);
                  setModels([]);
                  update({ aiProvider: id });
                }}
                placeholder="Search provider…"
              />
              {meta && (
                <div className="text-[9px] text-zinc-600 mt-1 font-mono">{meta.label} → <span className="text-zinc-500">{meta.baseUrl}</span></div>
              )}
            </>
          ) : (
            <div className="text-[10px] text-zinc-500 font-mono">No providers available.</div>
          )}
        </div>
      ) : (
        <div>
          <div className="text-[10px] text-zinc-500 font-mono mb-1">Base URL</div>
          <input
            className={inputCls}
            placeholder={LOCAL_DEFAULT_BASE_URL}
            value={localBaseUrl}
            onChange={e => { setLocalBaseUrl(e.target.value); setLoaded(false); setModels([]); update({ aiBaseUrl: e.target.value }); }}
          />
          {!localBaseUrl && <div className="text-[9px] text-zinc-600 mt-1 font-mono">default: {LOCAL_DEFAULT_BASE_URL}</div>}
        </div>
      )}

      <div>
        <div className="text-[10px] text-zinc-500 font-mono mb-1">API key {needsKey ? '' : '(optional for local models)'}</div>
        <input
          className={inputCls}
          placeholder={needsKey ? 'sk-…' : 'leave empty for local'}
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); update({ aiApiKey: e.target.value }); }}
        />
      </div>

      <div>
        <button
          onClick={loadModels}
          disabled={!canLoad || loading}
          className={`px-4 py-2 rounded-xl text-[11px] font-mono transition flex items-center gap-1.5 ${canLoad && !loading ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90' : 'bg-white/10 text-zinc-500 cursor-not-allowed'}`}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Loading models…' : 'Load models'}
        </button>
        {needsKey && !apiKey && !loading && (
          <div className="text-[9px] text-zinc-500 mt-1.5">Enter the API key to load the model list.</div>
        )}
        {error && <div className="text-[10px] text-red-400 mt-1.5 font-mono">{error}</div>}
      </div>

      {loaded && models.length > 0 && (
        <div>
          <div className="text-[10px] text-zinc-500 font-mono mb-1">Model ({models.length})</div>
          <select
            className={inputCls}
            value={settings.aiModel || ''}
            onChange={e => update({ aiModel: e.target.value })}
          >
            {models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}
      {loaded && models.length === 0 && (
        <div className="text-[10px] text-zinc-500">No models returned by this provider.</div>
      )}
    </div>
  );
}
