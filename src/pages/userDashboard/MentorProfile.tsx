import { useState } from 'react';
import {
    FiArrowLeft,
    FiBriefcase,
    FiCheckCircle,
    FiInstagram,
    FiLinkedin,
    FiMessageCircle,
    FiTag,
    FiTwitter,
    FiUsers,
    FiYoutube,
} from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { MENTORS, type MentorSocial } from './Explore';

const cardBg = 'rgba(255,255,255,0.02)';
const cardBorder = '1px solid rgba(205,220,57,.08)';

const SOCIAL_ICON_MAP: Record<MentorSocial['platform'], React.ReactNode> = {
    instagram: <FiInstagram size={16} />,
    x: <FiTwitter size={16} />,
    linkedin: <FiLinkedin size={16} />,
    youtube: <FiYoutube size={16} />,
};

type Tab = 'featured' | 'services' | 'community';

const MentorProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('featured');

    const mentor = MENTORS.find((m) => m.id === id);

    if (!mentor) {
        return (
            <div
                className="flex min-h-screen w-full flex-col items-center justify-center text-white"
                style={{ background: '#000' }}
            >
                <p className="mb-4 text-white/50">Mentor not found.</p>
                <Link to="/dashboard/explore">
                    <Button variant="white">Back to Explore</Button>
                </Link>
            </div>
        );
    }

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back
                </button>

                {/* Banner + overlapping avatar */}
                <div className="relative mb-16 sm:mb-20">
                    <img
                        src={mentor.banner}
                        alt={mentor.name}
                        className="h-40 sm:h-64 w-full rounded-2xl object-cover"
                        style={{ border: cardBorder }}
                    />
                    <div className="absolute -bottom-12 sm:-bottom-14 left-4 sm:left-8">
                        <img
                            src={mentor.avatar}
                            alt={mentor.name}
                            className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover"
                            style={{ border: '4px solid #05080340', boxShadow: '0 0 0 1.5px rgba(166,255,0,.35)' }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
                    {/* Left column */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-white text-2xl sm:text-3xl font-black">{mentor.name}</h1>
                            {mentor.verified && <FiCheckCircle className="text-[#a6ff00]" size={20} />}
                        </div>
                        <p className="text-white/50 text-sm sm:text-base mb-4">{mentor.title ?? mentor.tag}</p>

                        {mentor.socials && mentor.socials.length > 0 && (
                            <div className="flex items-center gap-4 mb-8 text-white/60">
                                {mentor.socials.map((s) => (
                                    <a
                                        key={s.platform}
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors hover:text-[#a6ff00]"
                                    >
                                        {SOCIAL_ICON_MAP[s.platform]}
                                    </a>
                                ))}
                            </div>
                        )}

                        <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xl">{mentor.bio}</p>

                        {mentor.categories && mentor.categories.length > 0 && (
                            <div className="rounded-xl p-5" style={{ background: cardBg, border: cardBorder }}>
                                <div className="flex items-center gap-2 mb-4 text-white font-bold text-sm">
                                    <FiTag size={15} />
                                    Creator Category
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {mentor.categories.map((c) => (
                                        <span
                                            key={c}
                                            className="px-3 py-1.5 rounded-md text-xs font-semibold"
                                            style={{ background: 'rgba(166,255,0,0.1)', color: '#a6ff00' }}
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div>
                        <div
                            className="flex items-center rounded-lg p-1 mb-5"
                            style={{ background: 'rgba(255,255,255,0.04)', border: cardBorder }}
                        >
                            {(
                                [
                                    { key: 'featured', label: 'Featured' },
                                    { key: 'services', label: 'Services' },
                                    { key: 'community', label: 'Community' },
                                ] as const
                            ).map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className="flex-1 px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer"
                                    style={{
                                        background: tab === t.key ? 'rgba(166,255,0,0.12)' : 'transparent',
                                        color: tab === t.key ? '#a6ff00' : 'rgba(255,255,255,0.5)',
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {tab === 'featured' && (
                            <div className="rounded-xl p-5" style={{ background: cardBg, border: cardBorder }}>
                                <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
                                    <FiMessageCircle className="text-[#a6ff00]" size={18} />
                                    Let's chat about your journey
                                </div>
                                <p className="text-white/50 text-xs leading-relaxed mb-4">
                                    I'd love to get to know you and understand what you're working toward.
                                </p>
                                <Button variant="green" className="w-full text-sm">
                                    Fill this, I'll reach out
                                </Button>
                            </div>
                        )}

                        {tab === 'services' && (
                            <div className="rounded-xl p-5" style={{ background: cardBg, border: cardBorder }}>
                                <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm">
                                    <FiBriefcase className="text-[#a6ff00]" size={18} />
                                    1:1 Mentoring Session
                                </div>
                                <p className="text-white/50 text-xs leading-relaxed mb-4">
                                    Book a session with {mentor.name.split(' ')[0]} to work through your specific goals.
                                </p>
                                <Button variant="green" className="w-full text-sm">
                                    Book a Session
                                </Button>
                            </div>
                        )}

                        {tab === 'community' && (
                            <div
                                className="flex flex-col items-center justify-center rounded-xl p-8 text-center"
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                <FiUsers size={28} className="text-white/20 mb-3" />
                                <p className="text-white/40 text-sm">No community activity yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorProfile;