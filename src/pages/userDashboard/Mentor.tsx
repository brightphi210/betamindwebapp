import React from 'react';
import {
    FiArrowLeft,
    FiAward,
    FiCheckCircle,
    FiGlobe,
    FiLinkedin,
    FiTag,
    FiTwitter
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';
import Button from '../../component/ui/Button';
import { useGetMentorProfile } from '../../hooks/queries/allQueriess';


type SocialLink = {
    linkedin?: string;
    twitter?: string;
    website?: string;
};

const SOCIAL_ICON_MAP: Record<keyof SocialLink, React.ReactNode> = {
    linkedin: <FiLinkedin size={16} />,
    twitter: <FiTwitter size={16} />,
    website: <FiGlobe size={16} />,
};

const SOCIAL_LABEL_MAP: Record<keyof SocialLink, string> = {
    linkedin: 'LinkedIn',
    twitter: 'X (Twitter)',
    website: 'Website',
};

// ─── Shared skeleton primitive ───────────────────────────────────────────────
const Bone: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
    <div
        className={`animate-pulse rounded-md ${className}`}
        style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
);

// ─── Product / course card (sidebar list item) ──────────────────────────────
// const MentorProductCard: React.FC<{ product: DigitalProduct }> = ({ product }) => (
//     <div
//         className="rounded-xl overflow-hidden flex flex-col gap-3 p-3 transition-colors hover:bg-white/[0.03]"
//         style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
//     >
//         <div className="flex gap-4">
//             <div className="relative shrink-0">
//                 <img
//                     src={product.thumbnail}
//                     alt={product.title}
//                     className="w-20 h-20 rounded-lg object-cover"
//                 />
//                 <span
//                     className="absolute -bottom-1.5 -left-1.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
//                     style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)' }}
//                 >
//                     {product.type === 'Course' ? <FiPlayCircle size={10} /> : <FiBookOpen size={10} />}
//                     {product.type}
//                 </span>
//             </div>
//             <div className="flex flex-col flex-1 min-w-0 justify-center">
//                 <h4 className="text-white font-bold text-sm mb-1 line-clamp-2 break-words">{product.title}</h4>
//                 <div className="flex items-center gap-3">
//                     <span className="flex items-center gap-1 text-white/50 text-xs">
//                         <FiStar size={12} className="text-amber-400 fill-amber-400" />
//                         {product.rating}
//                     </span>
//                     <span className="text-[#a6ff00] font-bold text-xs">{product.price}</span>
//                 </div>
//             </div>
//         </div>
//         <Link to={`/dashboard/products/${product.id}`}>
//             <Button variant="white" className="w-full text-xs py-2">
//                 {product.type === 'Course' ? 'View Course' : 'View Book'}
//             </Button>
//         </Link>
//     </div>
// );

// const NoProductsState: React.FC = () => (
//     <div
//         className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl"
//         style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}
//     >
//         <p className="text-white/40 text-sm">No courses or books yet</p>
//     </div>
// );

// ─── Not found state ─────────────────────────────────────────────────────────
// const MentorNotFound: React.FC = () => (
//     <div
//         className="w-full min-h-screen flex flex-col items-center justify-center px-6 text-center"
//         style={{
//             background:
//                 'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
//         }}
//     >
//         <h1 className="text-white text-2xl font-black mb-2">Mentor Not Found</h1>
//         <p className="text-white/40 text-sm mb-8">
//             We couldn't find the mentor you're looking for.
//         </p>
//         <Link
//             to="/dashboard/explore"
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
//             style={{ background: '#a6ff00' }}
//         >
//             <FiArrowLeft size={16} />
//             Back to Explore
//         </Link>
//     </div>
// );

// ─── Skeleton state ──────────────────────────────────────────────────────────
// Mirrors the real layout below (banner, avatar, name, bio, socials, tags,
// button) at the same sizes so there's no layout shift when data arrives.
const MentorSkeleton: React.FC = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Back link placeholder */}
        <div className="inline-flex items-center gap-1.5 mb-6">
            <FiArrowLeft size={14} className="text-white/20" />
            <Bone className="h-4 w-16" />
        </div>

        {/* Banner + avatar */}
        <div className="relative mb-16 sm:mb-20">
            <Bone className="w-full h-32 lg:h-38 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <Bone
                className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl z-10"
                style={{ border: '4px solid #05080e', boxShadow: '0 0 0 1px rgba(205,220,57,.1)' }}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2">
                {/* Name + follow button row */}
                <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
                    <div className="flex flex-col gap-2">
                        <Bone className="h-7 w-48" />
                        <Bone className="h-4 w-24" />
                    </div>
                    <Bone className="h-9 w-20 rounded-full" />
                </div>

                {/* Occupation */}
                <Bone className="h-4 w-40 mt-4 mb-3" />

                {/* Years of experience */}
                <Bone className="h-4 w-36 mb-4" />

                {/* Bio */}
                <div className="flex flex-col gap-2 mb-6 max-w-xl">
                    <Bone className="h-3.5 w-full" />
                    <Bone className="h-3.5 w-full" />
                    <Bone className="h-3.5 w-2/3" />
                </div>

                {/* Socials */}
                <div className="flex items-center gap-3 mb-8">
                    <Bone className="w-9 h-9 rounded-full" />
                    <Bone className="w-9 h-9 rounded-full" />
                    <Bone className="w-9 h-9 rounded-full" />
                </div>

                {/* Category tags box */}
                <div
                    className="rounded-xl p-5"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FiTag size={14} className="text-white/10" />
                        <Bone className="h-3.5 w-24" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Bone className="h-7 w-20 rounded-lg" />
                        <Bone className="h-7 w-24 rounded-lg" />
                        <Bone className="h-7 w-16 rounded-lg" />
                    </div>
                </div>

                {/* Book mentorship button */}
                <Bone className="h-11 w-full rounded-lg mt-3" />
            </div>
        </div>
    </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────
const Mentor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { aMentor, isLoading } = useGetMentorProfile(id)
    const mentor = aMentor?.data
    console.log('This Mentor', mentor, id)

    // if (!mentor) return <MentorNotFound />;

    // const mentorProducts = PRODUCTS?.filter((p) => p.author === mentor.name);

    // social_link comes back as a flat object: { linkedin, twitter, website }.
    // Filter out empty/unset entries so we only render icons for links that
    // actually have a URL.
    const socialLink: SocialLink = mentor?.social_link ?? {};
    const activeSocials = (Object.keys(socialLink) as (keyof SocialLink)[]).filter(
        (platform) => !!socialLink[platform]
    );

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
            {isLoading ? (
                <MentorSkeleton />
            ) : (
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
                            className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <img
                                src={mentor?.cover_images}
                                alt={mentor?.name}
                                className="w-full h-32 lg:h-38 object-cover"
                            />
                            <div
                                className="absolute inset-0 rounded-2xl"
                                style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)' }}
                            />
                        </div>

                        {/* Avatar — no longer inside the clipped banner container */}
                        <img
                            src={mentor?.profile?.avatar}
                            alt={mentor?.name}
                            className="absolute -bottom-12 left-6 w-24 h-24 rounded-2xl object-cover z-10"
                            style={{ border: '4px solid #05080e', boxShadow: '0 0 0 1px rgba(205,220,57,.2)' }}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                        {/* ── Left: Profile info ── */}
                        <div className="lg:col-span-2">
                            <div className="flex items-start justify-between gap-4 mb-1 flex-wrap">
                                <div>

                                    <h1 className="text-white text-2xl sm:text-3xl font-black flex items-center gap-2 flex-wrap">
                                        {mentor?.name}
                                        {mentor?.is_approved && (
                                            <FiCheckCircle size={20} className="text-[#a6ff00] shrink-0" />
                                        )}
                                    </h1>
                                    {mentor?.nick_name && (
                                        <p className="text-white/50 text-sm sm:text-base mb-3">@{mentor?.nick_name}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer shrink-0"
                                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}
                                    >
                                        Follow
                                    </button>

                                </div>
                            </div>

                            {mentor?.occupation && (
                                <p className="text-white/70 text-sm sm:text-base mb-3">- {mentor?.occupation}</p>
                            )}

                            {typeof mentor?.years_of_experience === 'number' && (
                                <div className="flex items-center gap-1.5 text-white/50 text-sm mb-4">
                                    <FiAward size={14} className="text-[#a6ff00]" />
                                    {mentor?.years_of_experience}+ years of experience
                                </div>
                            )}

                            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                                {mentor?.bio}
                            </p>

                            {/* Socials */}
                            {activeSocials?.length > 0 && (
                                <div className="flex items-center gap-3 mb-8">
                                    {activeSocials?.map((platform) => (
                                        <a
                                            key={platform}
                                            href={socialLink[platform]}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={SOCIAL_LABEL_MAP[platform]}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-[#a6ff00] transition-colors"
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                        >
                                            {SOCIAL_ICON_MAP[platform]}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Category tags box */}
                            {mentor?.categories && mentor?.categories.length > 0 && (
                                <div
                                    className="rounded-xl p-5"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                                >
                                    <div className="flex items-center gap-2 text-white font-bold text-sm mb-4">
                                        <FiTag size={14} className="text-[#a6ff00]" />
                                        Focus Areas
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {mentor?.categories.map((cat: string) => (
                                            <span
                                                key={cat}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize"
                                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className='mt-3 w-full'>
                                <Button variant="green" className="" onClick={handleBookMentorship}>
                                    Book Mentorship
                                </Button>
                            </div>

                        </div>

                        {/* ── Right: Courses & Books ── */}
                        {/* <div className="lg:col-span-1">
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
                        </div> */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Mentor;