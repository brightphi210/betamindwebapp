import React, { useEffect, useMemo, useState } from 'react';
import {
    FiBookOpen,
    FiCalendar,
    FiMoreHorizontal,
    FiPlayCircle,
    FiSearch,
    FiUsers,
    FiX,
} from 'react-icons/fi';
import { Link, useSearchParams } from 'react-router-dom';
import LoadingOverlay from '../../component/LoadingOverlay';
import { useGetAllEvents, useGetDigitalProduct, useGetMentors } from '../../hooks/queries/allQueriess';
import {
    buildTopicsFromMentors,
    EventCard,
    mapApiProductToCard,
    MentorCard,
    ProductCard,
    type ApiDigitalProduct,
    type Topic,
} from './Explore';
import {
    mapApiEventToRegistered,
    type ApiEvent,
} from './Overview';

type ResultType = 'mentors' | 'events' | 'courses' | 'ebooks';

const RESULT_TYPES: { key: ResultType; label: string; icon: React.ReactNode }[] = [
    { key: 'mentors', label: 'Mentors', icon: <FiUsers size={13} /> },
    { key: 'events', label: 'Events', icon: <FiCalendar size={13} /> },
    { key: 'courses', label: 'Courses', icon: <FiPlayCircle size={13} /> },
    { key: 'ebooks', label: 'Ebooks', icon: <FiBookOpen size={13} /> },
];

// How many category chips show inline before the rest collapse behind "•••"
const VISIBLE_CATEGORY_COUNT = 5;

const matches = (text: string | undefined | null, query: string) => {
    if (!query) return true;
    return (text ?? '').toLowerCase().includes(query.toLowerCase());
};

// ─── Reused meta chip styles ────────────────────────────────────────────────
const chipBase =
    'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer';

const SectionHeading: React.FC<{ icon: React.ReactNode; label: string; count: number }> = ({
    icon,
    label,
    count,
}) => (
    <div className="flex items-center gap-2 mb-4">
        <span style={{ color: '#a6ff00' }}>{icon}</span>
        <h2 className="text-white font-bold text-lg">{label}</h2>
        <span className="text-white/30 text-sm">· {count}</span>
    </div>
);

// ─── More categories modal ──────────────────────────────────────────────────
const MoreCategoriesModal: React.FC<{
    topics: Topic[];
    activeCategory: string;
    onSelect: (name: string) => void;
    onClose: () => void;
}> = ({ topics, activeCategory, onSelect, onClose }) => (
    <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col"
            style={{
                background: 'rgba(10,13,9,0.55)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold">All Categories</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                >
                    <FiX size={18} />
                </button>
            </div>
            <div className="overflow-y-auto flex-1 -mx-2 px-2">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onSelect('')}
                        className={`${chipBase} shrink-0`}
                        style={{
                            background: !activeCategory ? 'white' : 'rgba(255,255,255,0.04)',
                            color: !activeCategory ? 'black' : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${!activeCategory ? 'rgba(166,255,0,.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        All Categories
                    </button>
                    {topics.length === 0 && (
                        <p className="text-white/30 text-xs px-1 py-2">No categories yet.</p>
                    )}
                    {topics.map((topic) => {
                        const active = activeCategory.toLowerCase() === topic.name.toLowerCase();
                        return (
                            <button
                                key={topic.id}
                                type="button"
                                onClick={() => onSelect(active ? '' : topic.name)}
                                className={`${chipBase} shrink-0`}
                                style={{
                                    background: active ? 'white' : 'rgba(255,255,255,0.04)',
                                    color: active ? 'black' : 'rgba(255,255,255,0.5)',
                                    border: `1px solid ${active ? 'rgba(166,255,0,.3)' : 'rgba(255,255,255,0.08)'}`,
                                }}
                            >
                                {topic.name}
                                {active && <FiX size={12} />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
);

const SearchPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const [category, setCategory] = useState(searchParams.get('category') ?? '');
    const [activeTypes, setActiveTypes] = useState<Set<ResultType>>(
        new Set(['mentors', 'events', 'courses', 'ebooks'])
    );
    const [showMoreCategories, setShowMoreCategories] = useState(false);

    // Keep the URL shareable / bookmarkable as the person refines their search.
    useEffect(() => {
        const next = new URLSearchParams();
        if (query) next.set('q', query);
        if (category) next.set('category', category);
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, category]);

    const { mentors, isLoading: mentorsLoading } = useGetMentors();
    const { allEvents, isLoading: eventsLoading } = useGetAllEvents();
    const { digitalProduct, isLoading: productsLoading } = useGetDigitalProduct();

    const allMentors: any[] = mentors?.data?.results ?? [];
    const topics = useMemo(() => buildTopicsFromMentors(allMentors), [allMentors]);

    const rawEvents: ApiEvent[] = Array.isArray(allEvents?.data)
        ? allEvents.data
        : allEvents?.data?.results ?? [];
    const allRegisteredEvents = useMemo(() => rawEvents.map(mapApiEventToRegistered), [rawEvents]);

    const rawProducts: ApiDigitalProduct[] = Array.isArray(digitalProduct?.data)
        ? digitalProduct.data
        : digitalProduct?.data?.results ?? [];
    const publishedProducts = useMemo(
        () => rawProducts.filter((p) => p.is_published).map(mapApiProductToCard),
        [rawProducts]
    );

    const toggleType = (type: ResultType) => {
        setActiveTypes((prev) => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const clearAll = () => {
        setQuery('');
        setCategory('');
        setActiveTypes(new Set(['mentors', 'events', 'courses', 'ebooks']));
    };

    // Mentors and Courses/Ebooks respect the category filter (topics map to
    // mentor.categories and product tags); Events are filtered by keyword only
    // since events don't carry a category field.
    const filteredMentors = allMentors.filter((m) => {
        const inCategory =
            !category || (m.categories ?? []).some((c: string) => c.toLowerCase() === category.toLowerCase());
        const inQuery =
            !query ||
            matches(m.name, query) ||
            matches(m.nick_name, query) ||
            matches(m.bio, query) ||
            matches(m.occupation, query);
        return inCategory && inQuery;
    });

    const filteredEvents = allRegisteredEvents.filter(
        (e) => matches(e.title, query) || matches(e.description, query) || matches(e.location, query)
    );

    const filteredCourses = publishedProducts.filter(
        (p) => p.type === 'Course' && (matches(p.title, query) || matches(p.author, query))
    );

    const filteredEbooks = publishedProducts.filter(
        (p) => p.type === 'Book' && (matches(p.title, query) || matches(p.author, query))
    );

    const isLoading = mentorsLoading || eventsLoading || productsLoading;
    const hasAnyFilter = !!query || !!category;
    const totalResults =
        (activeTypes.has('mentors') ? filteredMentors.length : 0) +
        (activeTypes.has('events') ? filteredEvents.length : 0) +
        (activeTypes.has('courses') ? filteredCourses.length : 0) +
        (activeTypes.has('ebooks') ? filteredEbooks.length : 0);

    const visibleTopics = topics.slice(0, VISIBLE_CATEGORY_COUNT);
    // If the active category lives beyond the visible slice (picked from the
    // modal, or landed on via a direct link), still surface it inline so the
    // person can see/clear what's applied without reopening the modal.
    const activeHiddenTopic = topics.slice(VISIBLE_CATEGORY_COUNT).find(
        (t) => t.name.toLowerCase() === category.toLowerCase()
    );

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <LoadingOverlay visible={isLoading} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Search</h1>
                    <p className="text-white/40 text-base max-w-2xl">
                        Search across mentors, events, courses, and ebooks.
                    </p>
                </div>

                {/* Search bar */}
                <div
                    className="flex items-center gap-3 rounded-full px-4 py-4 mb-5 bg-neutral-900/40"
                >
                    <FiSearch size={16} className="text-white/40 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search mentors, events, courses, ebooks..."
                        className="w-full bg-transparent outline-none text-sm text-white placeholder-white/30"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="text-white/40 hover:text-white shrink-0"
                        >
                            <FiX size={16} />
                        </button>
                    )}
                </div>

                {/* Type filter chips */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    {RESULT_TYPES.map((t) => {
                        const active = activeTypes.has(t.key);
                        return (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => toggleType(t.key)}
                                className={chipBase}
                                style={{
                                    background: active ? 'white' : 'rgba(255,255,255,0.04)',
                                    color: active ? 'gray' : 'rgba(255,255,255,0.5)',
                                    border: `1px solid ${active ? 'rgba(166,255,0,.3)' : 'rgba(255,255,255,0.08)'}`,
                                }}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Category chips — derived from real mentor categories; a fixed
                    count shown inline, the rest collapse behind a "•••" button
                    that opens a modal listing every category */}
                <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 mb-6 topics-scroll">
                    <button
                        type="button"
                        onClick={() => setCategory('')}
                        className={`${chipBase} shrink-0`}
                        style={{
                            background: !category ? 'white' : 'rgba(255,255,255,0.04)',
                            color: !category ? 'black' : 'rgba(255,255,255,0.5)',
                            border: `1px solid ${!category ? 'rgba(166,255,0,.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        All Categories
                    </button>
                    {visibleTopics.map((topic) => {
                        const active = category.toLowerCase() === topic.name.toLowerCase();
                        return (
                            <button
                                key={topic.id}
                                type="button"
                                onClick={() => setCategory(active ? '' : topic.name)}
                                className={`${chipBase} shrink-0`}
                                style={{
                                    background: active ? 'white' : 'rgba(255,255,255,0.04)',
                                    color: active ? 'black' : 'rgba(255,255,255,0.5)',
                                    border: `1px solid ${active ? 'rgba(166,255,0,.3)' : 'rgba(255,255,255,0.08)'}`,
                                }}
                            >
                                {topic.name}
                                {active && <FiX size={12} />}
                            </button>
                        );
                    })}

                    {/* Surface the active category even if it's tucked in the modal's list */}
                    {activeHiddenTopic && (
                        <button
                            type="button"
                            onClick={() => setCategory('')}
                            className={`${chipBase} shrink-0`}
                            style={{
                                background: 'white',
                                color: 'black',
                                border: '1px solid rgba(166,255,0,.3)',
                            }}
                        >
                            {activeHiddenTopic.name}
                            <FiX size={12} />
                        </button>
                    )}

                    {topics.length > VISIBLE_CATEGORY_COUNT && (
                        <button
                            type="button"
                            onClick={() => setShowMoreCategories(true)}
                            aria-label="More categories"
                            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <FiMoreHorizontal size={16} />
                        </button>
                    )}
                </div>

                {/* Active filters + clear all */}
                {hasAnyFilter && (
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-white/40 text-xs">
                            {totalResults} result{totalResults === 1 ? '' : 's'}
                            {category && (
                                <>
                                    {' '}
                                    in <span className="text-white/70 font-semibold">{category}</span>
                                </>
                            )}
                            {query && (
                                <>
                                    {' '}
                                    for <span className="text-white/70 font-semibold">"{query}"</span>
                                </>
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs font-semibold shrink-0"
                            style={{ color: '#a6ff00' }}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {!isLoading && totalResults === 0 && (
                    <div
                        className="flex flex-col items-center justify-center text-center py-24"
                    >
                        <FiSearch size={32} className="text-white/15 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-1">No results found</h3>
                        <p className="text-white/40 text-sm mb-6 max-w-sm">
                            Try a different keyword, clear the category filter, or search across more result types.
                        </p>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
                            style={{ background: '#a6ff00' }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {/* Mentors */}
                {activeTypes.has('mentors') && filteredMentors.length > 0 && (
                    <section className="mb-14">
                        <SectionHeading icon={<FiUsers size={16} />} label="Mentors" count={filteredMentors.length} />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {filteredMentors.map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Events — same card as the Explore page. EventCard renders a
                    full-width row on mobile now, so this grid is single-column
                    on mobile and steps up to 4 columns on desktop. */}
                {activeTypes.has('events') && filteredEvents.length > 0 && (
                    <section className="mb-14">
                        <SectionHeading icon={<FiCalendar size={16} />} label="Events" count={filteredEvents.length} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Courses */}
                {activeTypes.has('courses') && filteredCourses.length > 0 && (
                    <section className="mb-14">
                        <SectionHeading icon={<FiPlayCircle size={16} />} label="Courses" count={filteredCourses.length} />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {filteredCourses.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Ebooks */}
                {activeTypes.has('ebooks') && filteredEbooks.length > 0 && (
                    <section className="mb-14">
                        <SectionHeading icon={<FiBookOpen size={16} />} label="Ebooks" count={filteredEbooks.length} />
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {filteredEbooks.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                )}

                {/* If types are toggled off but results exist elsewhere, nudge back */}
                {!isLoading && totalResults === 0 && hasAnyFilter && (
                    <div className="flex justify-center mt-2">
                        <Link to="/dashboard/explore" className="text-xs font-semibold" style={{ color: '#a6ff00' }}>
                            ← Back to Explore
                        </Link>
                    </div>
                )}
            </div>

            {showMoreCategories && (
                <MoreCategoriesModal
                    topics={topics}
                    activeCategory={category}
                    onSelect={(name) => {
                        setCategory(name);
                        setShowMoreCategories(false);
                    }}
                    onClose={() => setShowMoreCategories(false)}
                />
            )}

            <style>{`
        .topics-scroll::-webkit-scrollbar { height: 6px; }
        .topics-scroll::-webkit-scrollbar-track { background: transparent; }
        .topics-scroll::-webkit-scrollbar-thumb { background: rgba(205, 220, 57, 0.2); border-radius: 999px; }
        .topics-scroll { scrollbar-width: thin; scrollbar-color: rgba(205, 220, 57, 0.2) transparent; }
      `}</style>
        </div>
    );
};

export default SearchPage;