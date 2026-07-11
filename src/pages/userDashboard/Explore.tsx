import React from 'react';
import {
    FiBarChart2,
    FiBookOpen,
    FiBriefcase,
    FiCamera,
    FiCode,
    FiDollarSign,
    FiEdit3,
    FiInstagram,
    FiLinkedin,
    FiPenTool,
    FiPlayCircle,
    FiStar,
    FiTrendingUp,
    FiTwitter,
    FiYoutube,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface Topic {
    id: string;
    name: string;
    count: string;
    icon: React.ReactNode;
    color: string; // icon + border tint
}

export interface MentorSocial {
    platform: 'instagram' | 'x' | 'linkedin' | 'youtube';
    url: string;
}

export interface Mentor {
    id: string;
    name: string;
    avatar: string;
    banner: string;
    bio: string;
    tag: string;
    title?: string;
    verified?: boolean;
    categories?: string[];
    socials?: MentorSocial[];
    yearsExperience?: number;
}

export interface DigitalProduct {
    id: string;
    type: 'Course' | 'Book';
    title: string;
    author: string;
    thumbnail: string;
    price: string;
    rating: number;
}

// ─── Data ───────────────────────────────────────────────────────────────────
export const TOPICS: Topic[] = [
    { id: 't1', name: 'Design', count: '2.4K Mentors', icon: <FiPenTool size={25} />, color: '#f472b6' },
    { id: 't2', name: 'Engineering', count: '3.1K Mentors', icon: <FiCode size={25} />, color: '#facc15' },
    { id: 't3', name: 'Growth', count: '540 Mentors', icon: <FiTrendingUp size={25} />, color: '#4ade80' },
    { id: 't4', name: 'Finance', count: '880 Mentors', icon: <FiDollarSign size={25} />, color: '#a78bfa' },
    { id: 't5', name: 'Writing', count: '1.2K Mentors', icon: <FiEdit3 size={25} />, color: '#60a5fa' },
    { id: 't6', name: 'Business', count: '2K Mentors', icon: <FiBriefcase size={25} />, color: '#fb923c' },
    { id: 't7', name: 'Photography', count: '410 Mentors', icon: <FiCamera size={25} />, color: '#5eead4' },
    { id: 't8', name: 'Product', count: '1.6K Mentors', icon: <FiBarChart2 size={25} />, color: '#f87171' },
];

export const MENTORS: Mentor[] = [
    {
        id: 'm1',
        name: 'Amara Chen',
        avatar: 'https://i.pravatar.cc/80?img=47',
        banner: 'https://picsum.photos/seed/amarabanner/1200/400',
        bio: 'Ex-Google PM helping founders turn rough ideas into shippable products. I focus on scoping, prioritization, and getting to a v1 people actually want.',
        tag: 'Product Strategy',
        title: 'Product Lead, ex-Google',
        verified: true,
        categories: ['Product', 'Strategy', 'Startups'],
        socials: [
            { platform: 'linkedin', url: '#' },
            { platform: 'x', url: '#' },
        ],
        yearsExperience: 9,
    },
    {
        id: 'm2',
        name: 'Diego Ramirez',
        avatar: 'https://i.pravatar.cc/80?img=51',
        banner: 'https://picsum.photos/seed/diegobanner/1200/400',
        bio: 'Senior engineer coaching devs through system design interviews and career growth. 8 years shipping distributed systems at scale.',
        tag: 'Engineering',
        title: 'Staff Engineer',
        verified: true,
        categories: ['Engineering', 'System Design', 'Career'],
        socials: [
            { platform: 'linkedin', url: '#' },
            { platform: 'youtube', url: '#' },
        ],
        yearsExperience: 8,
    },
    {
        id: 'm3',
        name: 'Priya Nair',
        avatar: 'https://i.pravatar.cc/80?img=32',
        banner: 'https://picsum.photos/seed/priyabanner/1200/400',
        bio: 'Brand designer who has shaped identities for 3 unicorn startups. I help founders find a visual language that actually says something.',
        tag: 'Design',
        title: 'Brand Designer & Founder',
        verified: true,
        categories: ['Design', 'Branding'],
        socials: [
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' },
        ],
        yearsExperience: 11,
    },
    {
        id: 'm4',
        name: 'Jonah Field',
        avatar: 'https://i.pravatar.cc/80?img=14',
        banner: 'https://picsum.photos/seed/jonahbanner/1200/400',
        bio: 'Growth marketer specializing in zero-to-one acquisition for early stage teams. Ran growth at two YC startups.',
        tag: 'Growth',
        title: 'Growth Marketer',
        categories: ['Growth', 'Marketing'],
        socials: [
            { platform: 'x', url: '#' },
        ],
        yearsExperience: 6,
    },
    {
        id: 'm5',
        name: 'Sofia Bianchi',
        avatar: 'https://i.pravatar.cc/80?img=45',
        banner: 'https://picsum.photos/seed/sofiabanner/1200/400',
        bio: 'Angel investor and former CFO guiding founders through fundraising, from pre-seed pitch decks to Series A term sheets.',
        tag: 'Finance',
        title: 'Angel Investor, ex-CFO',
        verified: true,
        categories: ['Finance', 'Fundraising'],
        socials: [
            { platform: 'linkedin', url: '#' },
        ],
        yearsExperience: 15,
    },
    {
        id: 'm6',
        name: 'Marcus Lee',
        avatar: 'https://i.pravatar.cc/80?img=60',
        banner: 'https://picsum.photos/seed/marcusbanner/1200/400',
        bio: 'Bestselling author teaching clear, persuasive writing for busy professionals. Two decades in newsrooms before that.',
        tag: 'Writing',
        title: 'Author & Writing Coach',
        categories: ['Writing', 'Communication'],
        socials: [
            { platform: 'instagram', url: '#' },
            { platform: 'x', url: '#' },
        ],
        yearsExperience: 20,
    },
];

export const PRODUCTS: DigitalProduct[] = [
    {
        id: 'p1',
        type: 'Course',
        title: 'System Design From Scratch',
        author: 'Diego Ramirez',
        thumbnail: 'https://picsum.photos/seed/sysdesign/600/600',
        price: '$129',
        rating: 4.9,
    },
    {
        id: 'p2',
        type: 'Book',
        title: 'The Clarity Habit',
        author: 'Marcus Lee',
        thumbnail: 'https://picsum.photos/seed/claritybook/600/600',
        price: '$24',
        rating: 4.8,
    },
    {
        id: 'p3',
        type: 'Course',
        title: 'Brand Identity Foundations',
        author: 'Priya Nair',
        thumbnail: 'https://picsum.photos/seed/brandcourse/600/600',
        price: '$89',
        rating: 4.7,
    },
    {
        id: 'p4',
        type: 'Book',
        title: 'Raising Without Losing Control',
        author: 'Sofia Bianchi',
        thumbnail: 'https://picsum.photos/seed/raisingbook/600/600',
        price: '$19',
        rating: 4.6,
    },
    {
        id: 'p5',
        type: 'Course',
        title: 'Zero-to-One Growth Playbook',
        author: 'Jonah Field',
        thumbnail: 'https://picsum.photos/seed/growthcourse/600/600',
        price: '$99',
        rating: 4.9,
    },
    {
        id: 'p6',
        type: 'Book',
        title: 'Products People Love',
        author: 'Amara Chen',
        thumbnail: 'https://picsum.photos/seed/productsbook/600/600',
        price: '$22',
        rating: 4.8,
    },
];

// ─── Section header ─────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="mb-6">
        <h2 className="text-white text-xl sm:text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
    </div>
);

// ─── Topic card ─────────────────────────────────────────────────────────────
const TopicCard: React.FC<{ topic: Topic }> = ({ topic }) => (
    <button
        className="flex items-center gap-4 rounded-xl p-3 sm:p-5 text-left transition-colors hover:bg-white/[0.04] cursor-pointer lg:w-full w-fit"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div
            className=""
            style={{ color: topic.color }}
        >
            {topic.icon}
        </div>
        <div className="min-w-0">
            <p className="text-white font-bold text-base truncate">{topic.name}</p>
            <p className="text-white/40 text-sm">{topic.count}</p>
        </div>
    </button>
);

const SOCIAL_ICON_MAP: Record<MentorSocial['platform'], React.ReactNode> = {
    instagram: <FiInstagram size={13} />,
    x: <FiTwitter size={13} />,
    linkedin: <FiLinkedin size={13} />,
    youtube: <FiYoutube size={13} />,
};

// ─── Mentor card (same shape as the Featured Calendars cards) ──────────────
const MentorCard: React.FC<{ mentor: Mentor }> = ({ mentor }) => (
    <Link
        to={`/dashboard/mentors/${mentor.id}`}
        className="rounded-xl lg:p-5 p-3 sm:p-6 flex flex-col transition-colors hover:bg-white/[0.03]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="flex items-start justify-between mb-4">
            <img
                src={mentor.avatar}
                alt={mentor.name}
                className="w-14 h-14 rounded-xl object-cover"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button
                onClick={(e) => e.preventDefault()}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
            >
                Follow
            </button>
        </div>
        <h3 className="text-white font-bold text-base mb-1.5">{mentor.name}</h3>
        <p className="text-white/40 text-sm leading-relaxed lg:mb-4 mb-2 line-clamp-2">{mentor.bio}</p>
        <div className="flex items-center justify-between mt-auto">
            <span
                className="inline-block w-fit px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
            >
                {mentor.tag}
            </span>
            {mentor.socials && mentor.socials.length > 0 && (
                <div className="flex items-center gap-2 text-white/30">
                    {mentor.socials.slice(0, 2).map((s) => (
                        <span key={s.platform}>{SOCIAL_ICON_MAP[s.platform]}</span>
                    ))}
                </div>
            )}
        </div>
    </Link>
);

// ─── Digital product card ───────────────────────────────────────────────────
const ProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => (
    <Link
        to={`/dashboard/products/${product.id}`}
        className="rounded-xl overflow-hidden flex flex-col transition-colors hover:bg-white/[0.03] cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="relative">
            <img src={product.thumbnail} alt={product.title} className="w-full h-full aspect-video object-cover" />
            <span
                className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
                {product.type === 'Course' ? <FiPlayCircle size={13} /> : <FiBookOpen size={13} />}
                {product.type}
            </span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col flex-1">
            <h3 className="text-white font-bold text-base mb-1 break-words">{product.title}</h3>
            <p className="text-white/40 text-sm mb-3">{product.author}</p>
            <div className="flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1 text-white/60 text-xs">
                    <FiStar size={13} className="text-amber-400 fill-amber-400" />
                    {product.rating}
                </span>
                <span className="text-white font-bold text-sm">{product.price}</span>
            </div>
        </div>
    </Link>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Explore: React.FC = () => {
    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Header */}
                <div className="mb-14">
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Explore</h1>
                    <p className="text-white/40 text-base max-w-2xl">
                        Find topics you care about, connect with mentors, or pick up a course or book to
                        level up.
                    </p>
                </div>

                {/* Browse by Topics */}
                <section className="mb-16">
                    <SectionHeader title="Browse by Topics" />
                    {/* Horizontally scrollable on mobile, grid from sm breakpoint up */}
                    <div className="flex sm:grid gap-2 overflow-x-auto sm:overflow-visible sm:grid-cols-2 lg:grid-cols-3 -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 topics-scroll">
                        {TOPICS.map((topic) => (
                            <div key={topic.id} className="shrink-0 w-fit sm:w-auto sm:contents">
                                <TopicCard topic={topic} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Mentors */}
                <section className="mb-16">
                    <SectionHeader title="Featured Mentors" subtitle="Learn 1:1 from people who've done it" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MENTORS.map((mentor) => (
                            <MentorCard key={mentor.id} mentor={mentor} />
                        ))}
                    </div>
                </section>

                {/* Digital Products */}
                <section>
                    <SectionHeader title="Courses & Books" subtitle="Self-paced learning from top mentors" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PRODUCTS.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </div>

            <style>{`
        .topics-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .topics-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .topics-scroll::-webkit-scrollbar-thumb {
          background: rgba(205, 220, 57, 0.2);
          border-radius: 999px;
        }
        .topics-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(205, 220, 57, 0.2) transparent;
        }
      `}</style>
        </div>
    );
};

export default Explore;