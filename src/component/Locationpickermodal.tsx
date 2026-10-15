import React, { useEffect, useRef, useState } from 'react';
import { FiLoader, FiMapPin, FiSearch, FiX } from 'react-icons/fi';

// Free, no-key geocoder built on OpenStreetMap data (https://photon.komoot.io).
// Fair-use only: keep the debounce below, and don't call it on every keystroke.
const PHOTON_URL = 'https://photon.komoot.io/api/';

// Roughly Nigeria's bounding box: minLon,minLat,maxLon,maxLat.
// Set RESTRICT_TO_NIGERIA to false to search worldwide.
const RESTRICT_TO_NIGERIA = true;
const NIGERIA_BBOX = '2.6,4.2,14.7,13.9';

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

type Suggestion = { id: string; main: string; secondary: string; full: string };

const unique = (parts: Array<string | undefined>) =>
    parts.filter((p, i, arr): p is string => !!p && arr.indexOf(p) === i);

const toSuggestion = (feature: any, index: number): Suggestion | null => {
    const p = feature?.properties ?? {};
    const street = [p.housenumber, p.street].filter(Boolean).join(' ');

    const main = p.name || street;
    if (!main) return null;

    const secondaryParts = unique([
        p.name ? street : undefined,
        p.district,
        p.city || p.county,
        p.state,
    ]).filter((part) => part !== main);

    const secondary = secondaryParts.join(', ');
    const full = unique([main, ...secondaryParts]).join(', ');

    return {
        id: `${p.osm_type ?? 'x'}${p.osm_id ?? index}-${index}`,
        main,
        secondary,
        full,
    };
};

const LocationPickerModal: React.FC<{
    initialValue: string;
    onSelect: (address: string) => void;
    onClose: () => void;
}> = ({ initialValue, onSelect, onClose }) => {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const text = query.trim();
        if (text.length < MIN_CHARS) {
            setResults([]);
            setSearched(false);
            setError('');
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams({
                    q: text,
                    limit: '6',
                    lang: 'en',
                });
                if (RESTRICT_TO_NIGERIA) params.set('bbox', NIGERIA_BBOX);

                const res = await fetch(`${PHOTON_URL}?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`Photon returned ${res.status}`);

                const data = await res.json();
                const seen = new Set<string>();
                const list: Suggestion[] = [];

                (data.features ?? []).forEach((f: any, i: number) => {
                    const s = toSuggestion(f, i);
                    if (s && !seen.has(s.full)) {
                        seen.add(s.full);
                        list.push(s);
                    }
                });

                setResults(list);
                setSearched(true);
            } catch (err: any) {
                if (err?.name !== 'AbortError') {
                    setResults([]);
                    setSearched(false);
                    setError(
                        'Could not load suggestions right now. You can still use the address you typed.'
                    );
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    return (
        <div
            className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-24 backdrop-blur-sm bg-black/60"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Search address"
        >
            <div
                className="w-full max-w-md rounded-xl p-5 shadow-2xl"
                style={{
                    background: 'rgba(10,12,9,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-white text-lg font-bold">Event location</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-3"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <FiSearch size={15} className="text-white/40" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search venue or address"
                        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder-white/30"
                    />
                    {loading && <FiLoader size={14} className="animate-spin text-white/50" />}
                </div>

                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                <ul className="mt-3 max-h-72 overflow-y-auto flex flex-col gap-1">
                    {results.map((r) => (
                        <li key={r.id}>
                            <button
                                type="button"
                                onClick={() => onSelect(r.full)}
                                className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/5 cursor-pointer"
                            >
                                <FiMapPin size={15} className="mt-0.5 shrink-0 text-white/40" />
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-semibold text-white">
                                        {r.main}
                                    </span>
                                    {r.secondary && (
                                        <span className="block truncate text-xs text-white/40">
                                            {r.secondary}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>

                {searched && !loading && results.length === 0 && !error && (
                    <p className="mt-2 text-xs text-white/40">
                        No matches found. Try a nearby landmark or area, or use your address
                        exactly as typed below.
                    </p>
                )}

                {query.trim().length >= MIN_CHARS && (
                    <button
                        type="button"
                        onClick={() => onSelect(query.trim())}
                        className="mt-3 w-full rounded-lg py-2.5 text-xs font-semibold text-white/70 hover:text-white cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        Use "{query.trim()}" as typed
                    </button>
                )}
            </div>
        </div>
    );
};

export default LocationPickerModal;