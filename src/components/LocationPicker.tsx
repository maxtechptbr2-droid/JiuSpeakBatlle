import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Search, LocateFixed } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const C = { bg: '#080a12', gold: '#c9a84c', card: '#1a1d2e', card2: '#12152a', text: '#c0c5e0', muted: '#7b83b0', faint: '#4a5075', line: '#1e2235', line2: '#2a2d45' };

export interface LocationValue { name: string; lat: number; lng: number; }

interface Props {
  value: LocationValue | null;
  onChange: (location: LocationValue | null) => void;
  compact?: boolean;
}

export default function LocationPicker({ value, onChange, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<any>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true); setError('');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authFetch(`/api/locations/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const d = await res.json();
          setResults(d.results || []);
          if (!(d.results || []).length) setError('Nenhum local encontrado');
        } else setError('Erro na busca');
      } catch { setError('Erro na busca'); }
      setLoading(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const useMyLocation = () => {
    setError('');
    if (!navigator.geolocation) { setError('Geolocalização não suportada neste dispositivo.'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await authFetch(`/api/locations/reverse?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const d = await res.json();
            onChange({ name: d.displayName || 'Local atual', lat: d.lat ?? latitude, lng: d.lng ?? longitude });
            setOpen(false);
          } else setError('Não foi possível obter o endereço.');
        } catch { setError('Não foi possível obter o endereço.'); }
        setGeoLoading(false);
      },
      () => { setGeoLoading(false); setError('Permissão de localização negada — use a busca'); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const select = (r: any) => {
    onChange({ name: r.displayName, lat: r.lat, lng: r.lng });
    setOpen(false); setQuery(''); setResults([]);
  };

  const shortName = (n: string) => (n || '').split(',').slice(0, 2).join(',').trim();

  return (
    <>
      {/* trigger */}
      {value ? (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#c9a84c22', border: `0.5px solid ${C.gold}`, borderRadius: 20, padding: '5px 6px 5px 10px', maxWidth: 220 }}>
          <MapPin size={13} style={{ color: C.gold, flexShrink: 0 }} />
          <span onClick={() => setOpen(true)} style={{ fontSize: 12, color: C.gold, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{shortName(value.name)}</span>
          <button onClick={() => onChange(null)} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}><X size={14} /></button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 12, padding: '5px 4px' }}>
          <MapPin size={16} /> {compact ? '' : 'Localização'}
        </button>
      )}

      {/* modal */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: '#000b', zIndex: 250, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '10vh 16px 16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, border: `0.5px solid ${C.line2}`, borderRadius: 14, width: 440, maxWidth: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `0.5px solid ${C.line}` }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Adicionar localização</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', display: 'flex' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 14, overflowY: 'auto' }}>
              <button onClick={useMyLocation} disabled={geoLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '10px 12px', color: C.gold, fontSize: 13, cursor: 'pointer', marginBottom: 10 }}>
                <LocateFixed size={16} /> {geoLoading ? 'Obtendo localização...' : 'Usar minha localização'}
              </button>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.faint }} />
                <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar cidade, academia, local..."
                  style={{ width: '100%', background: C.card2, border: `0.5px solid ${C.line2}`, borderRadius: 10, padding: '10px 10px 10px 34px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {loading && <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: '10px 0' }}>Buscando...</p>}
              {error && !loading && <p style={{ textAlign: 'center', color: C.faint, fontSize: 12, padding: '10px 0' }}>{error}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {results.map((r, i) => (
                  <button key={i} onClick={() => select(r)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'none', border: 'none', borderBottom: `0.5px solid ${C.line}`, padding: '9px 4px', textAlign: 'left', cursor: 'pointer' }}>
                    <MapPin size={15} style={{ color: C.gold, flexShrink: 0, marginTop: 1 }} />
                    <span style={{ fontSize: 12.5, color: C.text, lineHeight: 1.4 }}>{r.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
