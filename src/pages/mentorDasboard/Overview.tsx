import React from 'react';
import {
    FiArrowRight,
    FiBookmark,
    FiCalendar,
    FiClock,
    FiUsers
} from 'react-icons/fi';
import 'swiper/css';
import 'swiper/css/navigation';

import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SoliGreenButtonsArrow } from '../../component/btns/Buttons';

interface QuickShortcut {
    id: string;
    title: string;
    description: string;
    status: string;
    image?: string;
    actionText: string;
}

interface UpcomingEvent {
    id: string;
    title: string;
    category: string;
    time: string;
    duration: string;
    date: string;
    image: string;
    action: string;
    registered?: number;
}

interface Product {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    popular?: boolean;
    price: string;
    type: string;
    category: 'Course' | 'Ebook';
}

interface Mentor {
    id: string;
    name: string;
    role: string;
    rating: number;
    image: string;
}

const Overview: React.FC = () => {
    const shortcuts: QuickShortcut[] = [
        {
            id: '1',
            title: 'Neural Architectures in Modern Fintech',
            description: 'Continue your module on decentralized liquidity pools and their impact on market stability.',
            status: 'IN PROGRESS',
            actionText: 'Resume Learning',
        },
    ];

    const upcomingEvents: UpcomingEvent[] = [
        {
            id: '1',
            title: 'The Future of Quant Finance with AI',
            category: 'Free',
            time: '2:00 PM',
            duration: '45 mins',
            date: 'Today',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
            action: 'JOIN',
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
            registered: 189,
        },
    ];

    const suggestedEvents: UpcomingEvent[] = [
        {
            id: '5',
            title: 'Advanced Machine Learning Architectures',
            category: 'Paid',
            time: '3:00 PM',
            duration: '1.5 hours',
            date: 'Nov 22',
            image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&h=350&fit=crop',
            action: 'JOIN',
            registered: 367,
        },
        {
            id: '6',
            title: 'Web3 & Blockchain Essentials',
            category: 'Free',
            time: '1:00 PM',
            duration: '45 mins',
            date: 'Nov 25',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=350&fit=crop',
            action: 'JOIN',
            registered: 512,
        },
        {
            id: '7',
            title: 'UX Design Principles for Modern Apps',
            category: 'Paid',
            time: '10:30 AM',
            duration: '1 hour',
            date: 'Nov 28',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=350&fit=crop',
            action: 'REGISTER',
            registered: 156,
        },
        {
            id: '8',
            title: 'AI Governance & Policy Frameworks',
            category: 'Free',
            time: '4:00 PM',
            duration: '1 hour',
            date: 'Dec 1',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=350&fit=crop',
            action: 'JOIN',
            registered: 234,
        },
        {
            id: '9',
            title: 'Product Strategy & Market Analysis',
            category: 'Paid',
            time: '2:30 PM',
            duration: '1.5 hours',
            date: 'Dec 3',
            image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&h=350&fit=crop',
            action: 'REGISTER',
            registered: 143,
        },
        {
            id: '10',
            title: 'Data Science for Financial Markets',
            category: 'Paid',
            time: '9:00 AM',
            duration: '2 hours',
            date: 'Dec 5',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=350&fit=crop',
            action: 'REGISTER',
            registered: 289,
        },
    ];

    const products: Product[] = [
        {
            id: 'c2',
            title: 'Fintech Risk Management',
            subtitle: 'Learn risk assessment and management in fintech applications.',
            image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=500&h=350&fit=crop',
            price: '$39.99',
            type: 'Course',
            category: 'Course',
        },
        {
            id: 'c3',
            title: 'Mastering UX Strategy',
            subtitle: 'Design user experiences that drive engagement and retention.',
            image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=350&fit=crop',
            price: '$59.99',
            type: 'Course',
            category: 'Course',
        },

        {
            id: 'c5',
            title: 'AI-Powered Product Design Workflows',
            subtitle: 'Build smarter products using AI tools and modern design workflows.',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=350&fit=crop',
            price: '$54.99',
            type: 'Course',
            category: 'Course',
        },
        // Ebooks
        {
            id: 'e1',
            title: 'Cyber Security',
            subtitle: 'by James Kessler',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=350&fit=crop',
            price: '$12.99',
            type: 'Digital Product',
            category: 'Ebook',
        },
        {
            id: 'e2',
            title: 'AI & Macro Economics',
            subtitle: 'by Dr. Sarah Ohu',
            image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=350&fit=crop',
            price: '$15.99',
            type: 'Digital Product',
            category: 'Ebook',
        }
    ];

    const mentors: Mentor[] = [
        { id: '1', name: 'Dr. Eleana Vance', role: 'AI Researcher', rating: 4.9, image: 'https://i.pravatar.cc/150?img=1&u=eleana' },
        { id: '2', name: 'Marcus Chen', role: 'Fintech Expert', rating: 4.8, image: 'https://i.pravatar.cc/150?img=2&u=marcus' },
        { id: '3', name: 'Sarah Johnson', role: 'UX Designer', rating: 4.9, image: 'https://i.pravatar.cc/150?img=3&u=sarah' },
        { id: '4', name: 'James Okafor', role: 'Blockchain Dev', rating: 4.7, image: 'https://i.pravatar.cc/150?img=4&u=james' },
        { id: '5', name: 'Priya Nair', role: 'Product Strategist', rating: 4.8, image: 'https://i.pravatar.cc/150?img=5&u=priya' },
        { id: '6', name: 'Luca Martini', role: 'Quant Analyst', rating: 4.6, image: 'https://i.pravatar.cc/150?img=6&u=luca' },
    ];

    const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
        <div className=" cursor-pointer">
            <div className="relative w-full aspect-4/3 overflow-hidden rounded mb-3 bg-black">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Type + Price Row */}
            <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 bg-white/10 text-[#84ff00] rounded text-[10px] font-semibold">
                    {product.category}
                </span>
                <span className="text-white font-bold text-sm">{product.price}</span>
            </div>

            {/* Title */}
            <h3 className="text-white font-bold text-sm leading-snug mb-1 group-hover:text-[#a6ff00] transition-colors">
                {product.title}
            </h3>

            {/* Subtitle */}
            <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
                {product.subtitle}
            </p>
        </div>
    );

    const SuggestedEventCard: React.FC<{ event: UpcomingEvent }> = ({ event }) => (
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8 lg:mb-12">
                    <h1 className="text-xl sm:text-xl font-bold text-white mb-2">
                        Welcome back, <span className="text-[#a6ff00]">Alex</span>
                    </h1>
                    <p className="text-white/50 text-sm">Beging the journey of exploration.</p>
                </div>

                <div className="mb-12 lg:mb-16">
                    <h2 className="text-xs font-semibold text-white/80 tracking-wider mb-2 lg:mb-2">Quick Shortcuts</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Yellow Card */}
                        <div className="lg:col-span-2 bg-[#a6ff00] rounded-lg p-5 sm:p-5 text-black">
                            <div className="inline-block px-3 py-1.5 border border-black rounded-full text-xs font-semibold mb-4">
                                {shortcuts[0].status}
                            </div>
                            <h3 className="text-base sm:text-xl font-bold mb-1 leading-tight">
                                {shortcuts[0].title}
                            </h3>
                            <p className="text-xs sm:text-basetext-black/80 mb-3 leading-relaxed">
                                {shortcuts[0].description}
                            </p>

                            <SoliGreenButtonsArrow text='Resume Learning' />
                        </div>

                        {/* Right Sidebar */}
                        <div className="lg:flex lg:flex-col grid grid-cols-2 lg:gap-3 gap-2">
                            {/* Saved Events */}
                            <div className="bg-[#000e07] backdrop-blur rounded-lg p-4 sm:p-4 ">
                                <div className="flex items-center gap-3 mb-2">
                                    <FiBookmark size={20} className="text-[#a6ff00]" />
                                    <h3 className="text-white font-semibold text-sm sm:text-sm">Saved Events</h3>
                                </div>
                                <div className="flex-col items-center gap-1 mb-2 ">

                                    <p className="text-white/60 text-xs sm:text-xs">
                                        <span className="text-[#a6ff00] font-semibold">4</span> events matching your interests.
                                    </p>
                                </div>
                            </div>

                            {/* My Calendar */}
                            <div className="bg-[#000e07] backdrop-blur rounded-lg p-4 sm:p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <FiCalendar size={20} className="text-[#a6ff00]" />
                                    <h3 className="text-white font-semibold text-sm sm:text-sm">My Calendar</h3>
                                </div>
                                <p className="text-white/60 text-xs sm:text-xs leading-normal"><span className="text-[#a6ff00] font-semibold">Upcoming:</span> AI Governance... <br />
                                    <span className="text-white/30">( @ Thurs. 2:00 PM )</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── UPCOMING EVENTS ── */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase">Upcoming Events</h2>
                        <a href="#" className="text-[#a6ff00] text-xs font-semibold flex items-center gap-2 transition-all">
                            View All <FiArrowRight size={16} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {upcomingEvents.map((event) => (
                            <div key={event.id} className="group bg-[#000b05]/20 rounded-sm overflow-hidden">
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
                                    <h3 className="text-white font-bold text-sm mb-3 line-clamp-2 leading-tight">
                                        {event.title}
                                    </h3>
                                    <div className="flex flex-col gap-2 mb-4 text-white/60 text-xs">
                                        <div className="flex items-center gap-2">
                                            <FiClock size={13} />
                                            <span>{event.time} • {event.duration} • {event.date}</span>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 rounded-md font-semibold text-xs bg-white text-neutral-800 cursor-pointer">
                                        Register
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── TOP PICKS — Mixed Courses + Ebooks ── */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase">Digital Products</h2>
                        <a href="#" className="text-[#a6ff00] text-xs font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                            View All <FiArrowRight size={16} />
                        </a>
                    </div>

                    {/* All Products Mixed - Category Badge identifies each */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* ── TOP MENTORS ── */}
                <div className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase">Top Mentors</h2>
                        <a href="#" className="text-[#a6ff00] text-xs font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                            View All <FiArrowRight size={16} />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-3">
                        {mentors.map((mentor) => (
                            <div key={mentor.id} className="group bg-white/5 p-4 py-3 rounded-md items-center gap-3 cursor-pointer">
                                <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 border border-white/10 group-hover:border-[#a6ff00]/50 transition-all duration-300">
                                    <img
                                        src={mentor.image}
                                        alt={mentor.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="min-w-0 pt-4">
                                    <h4 className="text-white font-semibold text-sm leading-tight group-hover:text-[#a6ff00] transition-colors truncate">
                                        {mentor.name}
                                    </h4>
                                    <p className="text-white/40 text-xs truncate mb-0.5">{mentor.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SUGGESTED EVENTS AVAILABLE TO JOIN — Swiper ── */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xs font-semibold text-white/70 tracking-widest uppercase">Suggested Events Available to Join</h2>
                        <a href="#" className="text-[#a6ff00] text-xs font-semibold flex items-center gap-2 transition-all">
                            View All <FiArrowRight size={16} />
                        </a>
                    </div>

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
                                <SuggestedEventCard event={event} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

            </div>
        </div>
    );
};

export default Overview;