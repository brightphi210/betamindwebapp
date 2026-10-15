import React, { useEffect, useMemo, useState } from 'react';
import { FiLoader } from 'react-icons/fi';

// Free, no-key API (community project on a free Render tier, so the first
// request after idle can take a while). If it fails, the fields turn into
// plain text inputs so the user is never blocked.
const API_URL = 'https://gps-naija.onrender.com/states';

type StateData = { name: string; lgas: string[] };

export type NigeriaLocation = { address: string; state: string; lga: string };

const fieldStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)',
};

const inputClass =
    'w-full rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#a6ff00]/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

// Fetched once per page load and shared by every component instance.
let cache: Promise<StateData[]> | null = null;

const parseStates = (json: any): StateData[] => {
    const list: any[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
            ? json
            : [];

    return list
        .map((s) => ({
            name: String(s?.name ?? s?.state ?? '').trim(),
            lgas: (s?.lgas ?? s?.LGA ?? s?.lga ?? [])
                .map((l: any) =>
                    (typeof l === 'string' ? l : String(l?.name ?? '')).trim()
                )
                .filter(Boolean)
                .sort((a: string, b: string) => a.localeCompare(b)),
        }))
        .filter((s) => s.name)
        .sort((a, b) => a.name.localeCompare(b.name));
};

const loadStates = (): Promise<StateData[]> => {
    if (!cache) {
        cache = fetch(API_URL)
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then((json) => {
                const states = parseStates(json);
                if (states.length === 0) throw new Error('Empty states list');
                return states;
            })
            .catch((err) => {
                cache = null; // allow a retry next time
                throw err;
            });
    }
    return cache;
};

const NigeriaLocationFields: React.FC<{
    value: NigeriaLocation;
    onChange: (next: NigeriaLocation) => void;
}> = ({ value, onChange }) => {
    const [states, setStates] = useState<StateData[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setFailed(false);
        loadStates()
            .then((data) => active && setStates(data))
            .catch(() => active && setFailed(true))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const lgas = useMemo(
        () => states.find((s) => s.name === value.state)?.lgas ?? [],
        [states, value.state]
    );

    const labelClass = 'block text-white/40 text-xs mb-1.5';

    return (
        <div className="flex flex-col gap-3">
            <div>
                <label className={labelClass}>Address</label>
                <input
                    value={value.address}
                    onChange={(e) => onChange({ ...value, address: e.target.value })}
                    placeholder="Street address or venue name"
                    className={inputClass}
                    style={fieldStyle}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>State</label>
                    {failed ? (
                        <input
                            value={value.state}
                            onChange={(e) =>
                                onChange({ ...value, state: e.target.value })
                            }
                            placeholder="e.g. Rivers"
                            className={inputClass}
                            style={fieldStyle}
                        />
                    ) : (
                        <div className="relative">
                            <select
                                value={value.state}
                                disabled={loading}
                                onChange={(e) =>
                                    onChange({
                                        ...value,
                                        state: e.target.value,
                                        lga: '',
                                    })
                                }
                                className={`${inputClass} cursor-pointer`}
                                style={{ ...fieldStyle, colorScheme: 'dark' }}
                            >
                                <option value="">
                                    {loading ? 'Loading states…' : 'Select state'}
                                </option>
                                {states.map((s) => (
                                    <option key={s.name} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {loading && (
                                <FiLoader
                                    size={14}
                                    className="animate-spin text-white/50 absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none"
                                />
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClass}>City / Local Government</label>
                    {failed ? (
                        <input
                            value={value.lga}
                            onChange={(e) =>
                                onChange({ ...value, lga: e.target.value })
                            }
                            placeholder="e.g. Port Harcourt"
                            className={inputClass}
                            style={fieldStyle}
                        />
                    ) : (
                        <select
                            value={value.lga}
                            disabled={!value.state || loading}
                            onChange={(e) =>
                                onChange({ ...value, lga: e.target.value })
                            }
                            className={`${inputClass} cursor-pointer`}
                            style={{ ...fieldStyle, colorScheme: 'dark' }}
                        >
                            <option value="">
                                {value.state
                                    ? 'Select local government'
                                    : 'Select a state first'}
                            </option>
                            {lgas.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {failed && (
                <p className="text-xs text-white/40">
                    Couldn't load the state list, so please type the state and
                    city manually.
                </p>
            )}
        </div>
    );
};

export default NigeriaLocationFields;