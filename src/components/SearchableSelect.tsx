import { useRef, useState } from 'react';

export interface SelectOption {
  id: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder = 'Select…' }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);
  const filtered = options.filter(o =>
    `${o.label} ${o.description ?? ''}`.toLowerCase().includes(query.toLowerCase())
  );

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(filtered.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlight]) select(filtered[highlight].id); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={rootRef} className="relative" onBlur={(e) => {
      if (!rootRef.current?.contains(e.relatedTarget as Node)) { setOpen(false); setQuery(''); }
    }}>
      <div className="relative">
        <input
          className="w-full px-3 py-2.5 pr-8 rounded-xl bg-white/[0.04] border border-white/15 text-xs outline-none focus:border-violet-500 text-zinc-200"
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : selected?.label ?? ''}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true); setHighlight(0); }}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={open}
        />
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-[#0d1117] border border-white/15 shadow-2xl overflow-hidden">
          {filtered.map((o, i) => (
            <button
              key={o.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); select(o.id); }}
              onMouseEnter={() => setHighlight(i)}
              className={`w-full text-left px-3 py-2 transition ${i === highlight ? 'bg-violet-600/25' : 'hover:bg-white/5'} ${o.id === value ? 'border-l-2 border-violet-500' : ''}`}
            >
              <div className="text-[11px] text-zinc-100 font-medium">{o.label}</div>
              {o.description && <div className="text-[9px] text-zinc-500 truncate mt-0.5">{o.description}</div>}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-[#0d1117] border border-white/15 shadow-2xl px-3 py-2 text-[10px] text-zinc-500">
          No providers match “{query}”
        </div>
      )}
    </div>
  );
}
