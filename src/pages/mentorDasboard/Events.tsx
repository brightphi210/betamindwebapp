import React, { useMemo, useState } from 'react';
import {
    FiClock,
    FiSearch,
    FiUsers
} from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';

import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Event {
    id: string;
    title: string;
    category: 'Free' | 'Paid';
    time: string;
    duration: string;
    date: string;
    image: string;
    action: string;
    instructor?: string;
    attendees?: number;
    registered?: number;
}

interface FilterOptions {
    category: string;
    searchQuery: string;
    sortBy: 'upcoming' | 'popular' | 'recent';
}

const ALL_EVENTS: Event[] = [
        {
            id: '1',
            title: 'The Future of Quant Finance with AI',
            category: 'Free',
            time: '2:00 PM',
            duration: '45 mins',
            date: 'Today',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
            action: 'JOIN',
            instructor: 'Dr. Marcus Chen',
            attendees: 1240,
            registered: 342,
        },
        {
            id: '2',
            title: 'CyberSecurity Fundamentals for Developers',
            category: 'Paid',
            time: '10:00 AM',
            duration: '1 hour',
            date: 'Nov 15',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'James Okafor',
            attendees: 856,
            registered: 128,
        },
        {
            id: '3',
            title: 'Global Economics Trends in the AI Era',
            category: 'Paid',
            time: '2:00 PM',
            duration: '45 mins',
            date: 'Nov 18',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
            action: 'DETAILS',
            instructor: 'Dr. Sarah Ohu',
            attendees: 923,
            registered: 215,
        },
        {
            id: '4',
            title: 'Ethical Design for Intelligent Systems',
            category: 'Free',
            time: '11:30 AM',
            duration: '1 hour',
            date: 'Nov 20',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
            action: 'DETAILS',
            instructor: 'Sarah Johnson',
            attendees: 567,
            registered: 189,
        },
        {
            id: '5',
            title: 'Advanced Machine Learning Architectures',
            category: 'Paid',
            time: '3:00 PM',
            duration: '1.5 hours',
            date: 'Nov 22',
            image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'Dr. Eleana Vance',
            attendees: 1450,
            registered: 367,
        },
        {
            id: '6',
            title: 'Web3 & Blockchain Essentials',
            category: 'Free',
            time: '1:00 PM',
            duration: '45 mins',
            date: 'Nov 25',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop',
            action: 'JOIN',
            instructor: 'Marcus Chen',
            attendees: 2100,
            registered: 512,
        },
        {
            id: '7',
            title: 'UX Design Principles for Modern Apps',
            category: 'Paid',
            time: '10:30 AM',
            duration: '1 hour',
            date: 'Nov 28',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'Sarah Johnson',
            attendees: 734,
            registered: 156,
        },
        {
            id: '8',
            title: 'AI Governance & Policy Frameworks',
            category: 'Free',
            time: '4:00 PM',
            duration: '1 hour',
            date: 'Dec 1',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
            action: 'DETAILS',
            instructor: 'Dr. Priya Nair',
            attendees: 892,
            registered: 234,
        },
        {
            id: '9',
            title: 'Product Strategy & Market Analysis',
            category: 'Paid',
            time: '2:30 PM',
            duration: '1.5 hours',
            date: 'Dec 3',
            image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'Priya Nair',
            attendees: 645,
            registered: 143,
        },
        {
            id: '10',
            title: 'Data Science for Financial Markets',
            category: 'Paid',
            time: '9:00 AM',
            duration: '2 hours',
            date: 'Dec 5',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'Luca Martini',
            attendees: 1678,
            registered: 289,
        },
        {
            id: '11',
            title: 'Cloud Architecture & Scalability',
            category: 'Free',
            time: '11:00 AM',
            duration: '1 hour',
            date: 'Dec 7',
            image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
            action: 'JOIN',
            instructor: 'James Okafor',
            attendees: 934,
            registered: 267,
        },
        {
            id: '12',
            title: 'Fintech Innovation & Disruption',
            category: 'Paid',
            time: '3:30 PM',
            duration: '1 hour',
            date: 'Dec 10',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
            action: 'REGISTER',
            instructor: 'Dr. Marcus Chen',
            attendees: 1156,
            registered: 298,
        },
    ];

const Event: React.FC = () => {
    const [filters, setFilters] = useState<FilterOptions>({
        category: 'All',
        searchQuery: '',
        sortBy: 'upcoming',
    });

    const [itemsToShow, setItemsToShow] = useState(8);

    const filteredAndSortedEvents = useMemo(() => {
        let result = [...ALL_EVENTS];

        if (filters.category !== 'All') {
            result = result.filter(event => event.category === filters.category);
        }

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(event =>
                event.title.toLowerCase().includes(query) ||
                event.instructor?.toLowerCase().includes(query)
            );
        }

        switch (filters.sortBy) {
            case 'popular':
                result.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
                break;
            case 'recent':
                result.reverse();
                break;
            case 'upcoming':
            default:
                break;
        }

        return result;
    }, [filters]);

    // Separate registered and suggested events
    const registeredEvents = filteredAndSortedEvents.slice(0, itemsToShow);
    const suggestedEvents = ALL_EVENTS.slice(itemsToShow, itemsToShow + 6);

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleLoadMore = () => {
        setItemsToShow(prev => prev + 8);
    };

    const categoryOptions = [
        { label: 'All Categories', value: 'All' },
        { label: 'Free Events', value: 'Free' },
        { label: 'Paid Events', value: 'Paid' },
    ];

    const EventCard: React.FC<{ event: Event }> = ({ event }) => (
        <div className="group bg-[#000b05]/20 rounded-sm overflow-hidden">
            <div className="relative w-full aspect-video overflow-hidden bg-black">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="inline-block absolute top-2 right-2 px-2 py-0.5 bg-white text-neutral-800 font-medium rounded text-[10px] mb-2 tracking-wide">
                    {event.category}
                </div>
            </div>
            <div className="p-2">
                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 leading-tight">
                    {event.title}
                </h3>
                <div className="flex flex-col gap-2 mb-3 text-white/60 text-xs">
                    <div className="flex items-center gap-2">
                        <FiClock size={13} />
                        <span>{event.time} • {event.duration} • {event.date}</span>
                    </div>
                    {event.registered && (
                        <div className="flex items-center gap-2 text-white/50">
                            <FiUsers size={13} />
                            <span>{event.registered} registered</span>
                        </div>
                    )}
                </div>
                <button className="w-full py-2 rounded-md font-semibold text-xs bg-white text-neutral-800 cursor-pointer">
                    {event.action}
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background: 'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.08), rgba(1, 12, 6, 0.4)), linear-gradient(180deg, rgba(20, 30, 15, 0.6) 0%, #000905 60%)'
            }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header with Search */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                            All Events
                        </h1>
                        <p className="text-white/50 text-sm">
                            Explore {ALL_EVENTS.length} upcoming events and workshops
                        </p>
                    </div>
                    <div className="relative flex-1 sm:flex-none sm:w-72">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={filters.searchQuery}
                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#a6ff00] focus:bg-white/15 transition-all"
                        />
                    </div>
                </div>

                {/* Category Buttons */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categoryOptions.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleFilterChange('category', cat.value)}
                            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${filters.category === cat.value
                                ? 'bg-[#a6ff00] text-neutral-900'
                                : 'bg-white/10 border border-white/20 text-white hover:border-[#a6ff00]/50'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Events Registered Section */}
                <div className="mb-16">
                    <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase mb-6">
                        Events Registered
                    </h2>

                    {registeredEvents.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                {registeredEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>

                            {filteredAndSortedEvents.length > itemsToShow && (
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="px-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-semibold text-sm hover:bg-white/15 hover:border-[#a6ff00]/50 transition-all"
                                    >
                                        Load More Events
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-white/50 text-sm">No events found</p>
                        </div>
                    )}
                </div>

                {/* Suggested Events Section - Swiper */}
                <div className="mb-8">
                    <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase mb-6">
                        Suggested Events Available for You
                    </h2>

                    <Swiper
                        modules={[Navigation]}
                        navigation
                        spaceBetween={16}
                        slidesPerView={1}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                        }}
                        className="swiper-container"
                    >
                        {suggestedEvents.map((event) => (
                            <SwiperSlide key={event.id}>
                                <EventCard event={event} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </div>
        </div>
    );
};

export default Event;