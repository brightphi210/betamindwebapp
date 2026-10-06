import { useMemo, useState } from "react";
import { FiCheck, FiPlus, FiSearch } from "react-icons/fi";
import type { Interest } from "../utils/interest";

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";

type Props = {
    interests: Interest[];
    selected: string[];
    onToggle: (id: string) => void;
    onAddCustom?: (value: string) => void;
    isLoading?: boolean;
    error?: string;
};

const DEFAULT_VISIBLE_INTERESTS = 12;

const InterestPicker = ({ interests, selected, onToggle, onAddCustom, isLoading, error }: Props) => {
    const [query, setQuery] = useState("");
    const [customValue, setCustomValue] = useState("");
    const [showAll, setShowAll] = useState(false);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? interests.filter((i) => i.name.toLowerCase().includes(q)) : interests;
    }, [interests, query]);

    const shownInterests = useMemo(() => {
        if (!visible.length || query.trim()) return visible;
        return showAll ? visible : visible.slice(0, DEFAULT_VISIBLE_INTERESTS);
    }, [query, showAll, visible]);

    const canShowMore = !query.trim() && visible.length > DEFAULT_VISIBLE_INTERESTS;

    if (isLoading) {
        return (
            <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-10 w-28 animate-pulse rounded-full bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={15} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search interests"
                    className="w-full rounded-md py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]"
                    style={{ background: cardBg, border: cardBorder }}
                />
            </div>

            {onAddCustom && (
                <div className="flex gap-2 flex-row">
                    <input
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                const value = customValue.trim();
                                if (!value) return;
                                onAddCustom(value);
                                setCustomValue("");
                            }
                        }}
                        placeholder="Add your own interest"
                        className="flex-1 rounded-md px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]"
                        style={{ background: cardBg, border: cardBorder }}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            const value = customValue.trim();
                            if (!value) return;
                            onAddCustom(value);
                            setCustomValue("");
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold text-black transition-colors hover:opacity-90"
                        style={{ background: "#a6ff00" }}
                    >
                        <FiPlus size={12} />
                        Add
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-2.5">
                {shownInterests.map((interest, idx) => {
                    const isSelected = selected.includes(interest.id);
                    return (
                        <button
                            key={interest.id}
                            type="button"
                            onClick={() => onToggle(interest.id)}
                            aria-pressed={isSelected}
                            className="anim-chip inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                                animationDelay: `${Math.min(idx, 24) * 25}ms`,
                                background: isSelected ? "rgba(166,255,0,0.12)" : cardBg,
                                color: isSelected ? "#a6ff00" : "rgba(255,255,255,0.7)",
                            }}
                        >
                            {isSelected && <FiCheck size={13} />}
                            {interest.name}
                        </button>
                    );
                })}
                {visible.length === 0 && (
                    <p className="text-sm text-white/40">
                        {interests.length === 0 ? "No interests available yet." : "No interests match your search."}
                    </p>
                )}
            </div>

            {canShowMore && (
                <button
                    type="button"
                    onClick={() => setShowAll((prev) => !prev)}
                    className="text-sm font-semibold text-[#a6ff00] transition-opacity hover:opacity-80"
                >
                    {showAll ? "Show less" : "More"}
                </button>
            )}

            <p className="text-xs text-white/40">{selected.length} selected</p>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
};

export default InterestPicker;