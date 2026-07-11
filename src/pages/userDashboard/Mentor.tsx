import React from 'react';
import {
    FiArrowLeft,
    FiAward,
    FiBookOpen,
    FiCheckCircle,
    FiInstagram,
    FiLinkedin,
    FiPlayCircle,
    FiStar,
    FiTag,
    FiTwitter,
    FiUsers,
    FiYoutube,
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { MENTORS, PRODUCTS, type DigitalProduct, type MentorSocial, type Mentor as MentorType } from './Explore';

const SOCIAL_ICON_MAP: Record<MentorSocial['platform'], React.ReactNode> = {
    instagram: <FiInstagram size={16} />,
    x: <FiTwitter size={16} />,
    linkedin: <FiLinkedin size={16} />,
    youtube: <FiYoutube size={16} />,
};

// ─── Product / course card (sidebar list item) ──────────────────────────────
const MentorProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => (
    <div
        className="rounded-xl overflow-hidden flex flex-col gap-3 p-3 transition-colors hover:bg-white/[0.03]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
        <div className="flex gap-4">
            <div className="relative shrink-0">
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                />
                <span
                    className="absolute -bottom-1.5 -left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)' }}
                >
                    {product.type === 'Course' ? <FiPlayCircle size={10} /> : <FiBookOpen size={10} />}
                    {product.type}
                </span>
            </div>
            <div className="flex flex-col flex-1 min-w-0 justify-center">
                <h4 className="text-white font-bold text-sm mb-1 line-clamp-2 break-words">{product.title}</h4>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                        <FiStar size={12} className="text-amber-400 fill-amber-400" />
                        {product.rating}
                    </span>
                    <span className="text-[#a6ff00] font-bold text-xs">{product.price}</span>
                </div>
            </div>
        </div>
        <Link to={`/dashboard/products/${product.id}`}>
            <Button variant="white" className="w-full text-xs py-2">
                {product.type === 'Course' ? 'View Course' : 'View Book'}
            </Button>
        </Link>
    </div>
);

const NoProductsState: React.FC = () => (
    <div
        className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
    >
        <p className="text-white/40 text-sm">No courses or books yet</p>
    </div>
);

// ─── Not found state ─────────────────────────────────────────────────────────
const MentorNotFound: React.FC = () => (
    <div
        className="w-full min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
            background:
                'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
        }}
    >
        <h1 className="text-white text-2xl font-black mb-2">Mentor Not Found</h1>
        <p className="text-white/40 text-sm mb-8">
            We couldn't find the mentor you're looking for.
        </p>
        <Link
            to="/dashboard/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
            style={{ background: '#a6ff00' }}
        >
            <FiArrowLeft size={16} />
            Back to Explore
        </Link>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Mentor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mentor: MentorType | undefined = MENTORS.find((m) => m.id === id);

    if (!mentor) return <MentorNotFound />;

    const mentorProducts = PRODUCTS.filter((p) => p.author === mentor.name);

    const handleBookMentorship = () => {
        // Hook this up to your booking flow / modal / route
        console.log('Book mentorship with', mentor.name);
    };

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
            }}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Back link */}
                <Link
                    to="/dashboard/explore"
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm font-semibold mb-6 transition-colors"
                >
                    <FiArrowLeft size={14} />
                    Explore
                </Link>

                {/* Banner + avatar — avatar sits in its own wrapper OUTSIDE the
                    overflow-hidden banner box so it doesn't get clipped */}
                <div className="relative mb-16 sm:mb-20">
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <img
                            src={mentor.banner}
                            alt={mentor.name}
                            className="w-full h-44 sm:h-64 object-cover"
                        />
                        <div
                            className="absolute inset-0 rounded-2xl"
                            style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }}
                        />
                    </div>

                    {/* Avatar — no longer inside the clipped banner container */}
                    <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl object-cover z-10"
                        style={{ border: '4px solid #05080e', boxShadow: '0 0 0 1px rgba(205,220,57,.2)' }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                    {/* ── Left: Profile info ── */}
                    <div className="lg:col-span-2">
                        <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
                            <h1 className="text-white text-2xl sm:text-3xl font-black flex items-center gap-2 flex-wrap">
                                {mentor.name}
                                {mentor.verified && (
                                    <FiCheckCircle size={20} className="text-[#a6ff00] shrink-0" />
                                )}
                            </h1>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer shrink-0"
                                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                                >
                                    Follow
                                </button>
                                <Button variant="green" className="text-sm px-5 py-2" onClick={handleBookMentorship}>
                                    Book Mentorship
                                </Button>
                            </div>
                        </div>

                        {mentor.title && (
                            <p className="text-white/50 text-sm sm:text-base mb-3">{mentor.title}</p>
                        )}

                        {typeof mentor.yearsExperience === 'number' && (
                            <div className="flex items-center gap-1.5 text-white/50 text-sm mb-4">
                                <FiAward size={14} className="text-[#a6ff00]" />
                                {mentor.yearsExperience}+ years of experience
                            </div>
                        )}

                        <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                            {mentor.bio}
                        </p>

                        {/* Socials */}
                        {mentor.socials && mentor.socials.length > 0 && (
                            <div className="flex items-center gap-3 mb-8">
                                {mentor.socials.map((s) => (
                                    <a
                                        key={s.platform}
                                        href={s.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-[#a6ff00] transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                    >
                                        {SOCIAL_ICON_MAP[s.platform]}
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* Category tags box */}
                        <div
                            className="rounded-xl p-5"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <div className="flex items-center gap-2 text-white font-bold text-sm mb-4">
                                <FiTag size={14} className="text-[#a6ff00]" />
                                Focus Areas
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(mentor.categories && mentor.categories.length > 0
                                    ? mentor.categories
                                    : [mentor.tag]
                                ).map((cat) => (
                                    <span
                                        key={cat}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Courses & Books ── */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-white font-bold text-base">Courses & Books</h2>
                            {mentorProducts.length > 0 && (
                                <span className="flex items-center gap-1 text-white/30 text-xs">
                                    <FiUsers size={12} />
                                    {mentorProducts.length}
                                </span>
                            )}
                        </div>

                        {mentorProducts.length === 0 ? (
                            <NoProductsState />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {mentorProducts.map((product) => (
                                    <MentorProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Mentor;