import { useState } from "react";
import { BsStarFill } from "react-icons/bs";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import {
    FiAlertCircle,
    FiBookOpen,
    FiCheckCircle,
    FiGlobe,
    FiLoader,
    FiPlayCircle,
    FiSend,
    FiShare2,
    FiShoppingBag,
    FiTag,
    FiTarget,
    FiUser,
    FiX,
    FiZap,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import logo from '../../assets/betamindlogo.png';
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder, pageBackground } from "../../component/MentorDashboardStyles";
import { useBookMentorship } from "../../hooks/mutations/allMutation";
import { useGetMentorDigitalProduct, useGetMyMentorProfile, useGetMyUserProfile } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";


type ApiDigitalProduct = {
    id: string;
    mentor: string;
    user_name: string;
    link: string;
    product_type: "course" | "book";
    title: string;
    description: string;
    course_content: { title: string; description: string }[] | null;
    cover_image: string | null;
    price: string;
    is_published: boolean;
    video: string | null;
    summary: string | null;
    created_at: string;
};

type Product = {
    id: string;
    type: "Course" | "Book";
    title: string;
    price: number;
    thumbnail: string | null;
    sold: number;
    rating: number;
    link: string;
};

const mapApiProductToProduct = (p: ApiDigitalProduct): Product => ({
    id: p.id,
    type: p.product_type === "course" ? "Course" : "Book",
    title: p.title,
    price: Number(p.price) || 0,
    thumbnail: p.cover_image,
    // Not returned by this endpoint yet — default to 0 until the API exposes them.
    sold: 0,
    rating: 0,
    link: p.link,
});

const extractHandle = (url?: string) => {
    if (!url) return "";
    const clean = url.replace(/\/$/, "");
    return clean.substring(clean.lastIndexOf("/") + 1).replace(/^@/, "");
};

// ---------- Product card (public, read-only — links straight out) ----------

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <a
        href={product.link || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col overflow-hidden rounded-xl transition-colors hover:bg-white/[0.03]"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="relative">
            {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.title} className="h-40 w-full object-cover sm:h-48" />
            ) : (
                <div
                    className="flex h-40 w-full items-center justify-center sm:h-48"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                >
                    {product.type === "Course" ? (
                        <FiPlayCircle size={28} className="text-white/15" />
                    ) : (
                        <FiBookOpen size={28} className="text-white/15" />
                    )}
                </div>
            )}
            <span
                className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
            >
                {product.type === "Course" ? <FiPlayCircle size={13} /> : <FiBookOpen size={13} />}
                {product.type}
            </span>
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
            <h3 className="mb-1 break-words text-base font-bold text-white">{product.title}</h3>
            <p className="mb-3 text-sm text-white/40">{product.sold} sold</p>
            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-white/60">
                    {product.rating > 0 ? (
                        <>
                            <BsStarFill size={13} className="fill-amber-400 text-amber-400" />
                            <p>{product.rating}</p>
                        </>
                    ) : (
                        <p className="text-white/30">No ratings yet</p>
                    )}
                </div>
                <span className="text-sm font-bold text-white">${product.price}</span>
            </div>
        </div>
    </a>
);

const ProductCardSkeleton: React.FC = () => (
    <div className="flex flex-col overflow-hidden rounded-xl animate-pulse" style={{ background: cardBg, border: cardBorder }}>
        <div className="h-40 w-full bg-white/5 sm:h-48" />
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
            <div className="h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
    </div>
);

const EmptyProducts: React.FC = () => (
    <div
        className="col-span-full flex flex-col items-center justify-center rounded-xl px-4 py-14 text-center"
        style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <FiShoppingBag size={22} className="mb-3 text-white/20" />
        <p className="text-sm text-white/40">No products listed yet.</p>
    </div>
);

// ---------- Book mentorship goal chips (mirrors the Mentor detail page) ----------
const MENTORSHIP_GOALS = [
    "Career guidance",
    "Skill development",
    "Interview preparation",
    "Resume / portfolio review",
    "Business or startup advice",
    "Something else",
] as const;

type BookMentorshipPayload = {
    goal: string;
    message: string;
};

// ---------- Book mentorship modal (same pattern as the Mentor detail page) ----------
const BookMentorshipModal: React.FC<{
    mentorName: string;
    mentorAvatar?: string;
    isSubmitting?: boolean;
    errorMessage?: string | null;
    onClose: () => void;
    onSubmit: (payload: BookMentorshipPayload) => void;
}> = ({ mentorName, mentorAvatar, isSubmitting = false, errorMessage, onClose, onSubmit }) => {
    const [goal, setGoal] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const canSubmit = !!goal && message.trim().length > 0 && !isSubmitting;

    const handleSubmit = () => {
        if (!canSubmit || !goal) return;
        onSubmit({ goal, message: message.trim() });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
            onClick={isSubmitting ? undefined : onClose}
        >
            <div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        {mentorAvatar ? (
                            <img
                                src={mentorAvatar}
                                alt={mentorName}
                                className="h-11 w-11 shrink-0 rounded-xl object-cover"
                                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                        ) : (
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: "rgba(255,255,255,0.08)" }}
                            >
                                <FiUser size={18} className="text-white/40" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold leading-tight text-white">Book mentorship</h3>
                            <p className="truncate text-xs text-white/40">with {mentorName}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Error banner */}
                {errorMessage && (
                    <div
                        className="mb-5 flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-xs font-medium"
                        style={{ background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.25)", color: "#ff9a9a" }}
                    >
                        <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Goal selection */}
                <div className="mb-6">
                    <label className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                        <FiTarget size={14} className="text-neutral-400" />
                        What best describes the goal of your mentorship?
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {MENTORSHIP_GOALS.map((option) => {
                            const active = goal === option;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setGoal(option)}
                                    className="cursor-pointer rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                                    style={
                                        active
                                            ? { background: "#a6ff00", color: "#000" }
                                            : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.1)" }
                                    }
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-white">Write a message to {mentorName}</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Hi ${mentorName}, I'd love your help with...`}
                        rows={5}
                        disabled={isSubmitting}
                        className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/25 disabled:opacity-60"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-sm font-bold text-black transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: "#fff" }}
                >
                    {isSubmitting ? (
                        <>
                            <FiLoader size={14} className="animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <FiSend size={14} />
                            Send request
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// ---------- Floating "Powered by Betamind" badge ----------
const PoweredByBadge: React.FC = () => (
    <a
        href="https://betamind.online"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 bg-white text-black right-5 z-40 flex items-center gap-2 rounded-full px-6 py-3 text-xs font-semibold  shadow-2xl transition-transform hover:scale-[1.04]"
        style={{
            backdropFilter: "blur(12px)",
        }}
    >
        <FiZap size={13} />
        <span className="italic">Powered by</span> <span className="text-[#547511] text-base font-bold">Betamind</span>
    </a>
);

// ---------- Page ----------

const PublicProfile = () => {
    const { addToast } = useGlobalContext();
    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const { myMentorProfile, isLoading: mentorLoading } = useGetMyMentorProfile();
    const { digitalProduct, isLoading: productsLoading } = useGetMentorDigitalProduct();
    const { mutate: bookMentorship, isPending: isBooking } = useBookMentorship();

    const [copied, setCopied] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const userProfile = myProfile?.data;
    const mentorProfile = myMentorProfile?.data;

    const rawProducts: ApiDigitalProduct[] = Array.isArray(digitalProduct?.data)
        ? digitalProduct.data
        : digitalProduct?.data?.results ?? [];
    const publishedProducts = rawProducts.filter((p) => p.is_published);
    const products: Product[] = publishedProducts.map(mapApiProductToProduct);

    const categories: string[] = Array.isArray(mentorProfile?.categories) ? mentorProfile.categories : [];
    const socialLink = mentorProfile?.social_link ?? {};
    const linkedinHandle = extractHandle(socialLink.linkedin);
    const xHandle = extractHandle(socialLink.twitter);
    const website: string = socialLink.website ?? "";

    const mentorName =
        mentorProfile?.nick_name || `${userProfile?.first_name ?? ""} ${userProfile?.last_name ?? ""}`.trim() || "Mentor";
    const mentorAvatar: string | undefined = userProfile?.avatar;
    const mentorId: string | undefined = mentorProfile?.id;

    const publicUrl = userProfile?.username ? `${window.location.origin}/${userProfile.username}` : window.location.href;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: `${userProfile?.first_name}'s profile`, url: publicUrl });
                return;
            }
            await navigator.clipboard.writeText(publicUrl);
            setCopied(true);
            addToast("Profile link copied", "success");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
                addToast("Could not copy link. Please try again.", "error");
            }
        }
    };

    const handleBookMentorship = () => {
        setBookingError(null);
        setShowBookModal(true);
    };

    const handleCloseBookModal = () => {
        if (isBooking) return; // avoid closing mid-request
        setShowBookModal(false);
        setBookingError(null);
    };

    const handleBookingSubmit = (payload: BookMentorshipPayload) => {
        if (!mentorId) {
            setBookingError("Missing mentor reference. Please refresh and try again.");
            return;
        }

        setBookingError(null);

        bookMentorship(
            {
                mentor_id: mentorId,
                goal: payload.goal,
                description: payload.message,
            },
            {
                onSuccess: () => {
                    setShowBookModal(false);
                    toast(`Your request was sent to ${mentorName}.`, { type: "success" });
                },
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        error?.response?.detail ||
                        error?.response?.data?.detail ||
                        "Something went wrong while sending your request. Please try again.";
                    toast(message, { type: "error" });
                },
            }
        );
    };

    const loading = userLoading || mentorLoading;

    if (loading) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <LoadingOverlay visible={true} />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
            <ToastContainer theme="dark" />
            <LoadingOverlay visible={isBooking} />

            <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
                {/* Logo bar */}
                <div className="flex h-16 items-center sm:h-20">
                    <Link to={'/'}
                        className="flex items-center w-28 justify-center rounded-lg text-xs font-black"
                        title="Logo placeholder"
                    >
                        <img src={logo} alt="Logo" className="" />
                    </Link>
                </div>

                {/* Cover + avatar */}
                <div className="relative mb-16 sm:mb-20">
                    <div
                        className="h-32 w-full overflow-hidden rounded-b-2xl sm:h-48"
                        style={{
                            background: mentorProfile?.cover_images
                                ? undefined
                                : "linear-gradient(160deg, #6ee7b7 0%, #a6ff00 45%, #0a0d09 100%)",
                        }}
                    >
                        {mentorProfile?.cover_images && (
                            <img src={mentorProfile.cover_images} alt="Cover" className="h-full w-full object-cover" />
                        )}
                    </div>

                    {/* Share — kept obvious with solid accent fill instead of a translucent icon-only button */}
                    <button
                        type="button"
                        onClick={() => {
                            void handleShare();
                        }}
                        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-black shadow-lg transition-transform hover:scale-[1.03]"
                        style={{ background: "#a6ff00" }}
                    >
                        {copied ? <FiCheckCircle size={14} /> : <FiShare2 size={14} />}
                        {copied ? "Copied!" : "Share profile"}
                    </button>

                    <div className="absolute -bottom-12 left-4 sm:-bottom-14 sm:left-6">
                        <div
                            className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 sm:h-28 sm:w-28"
                        >
                            {userProfile?.avatar ? (
                                <img src={userProfile.avatar} alt="Profile" className="h-full w-full rounded-xl object-cover" />
                            ) : (
                                <FiUser size={32} className="text-black/20" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Identity */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-white sm:text-3xl">
                                {mentorProfile?.nick_name || `${userProfile?.first_name ?? ""} ${userProfile?.last_name ?? ""}`.trim()}
                            </h1>
                            {mentorProfile?.occupation && (
                                <p className="mt-1 text-sm font-semibold text-white/60">{mentorProfile.occupation}</p>
                            )}
                        </div>

                        {/* Book mentor — primary CTA */}
                        <button
                            type="button"
                            onClick={handleBookMentorship}
                            className="cursor-pointer flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-black transition-transform hover:scale-[1.02]"
                        >
                            Book mentor
                        </button>
                    </div>

                    {mentorProfile?.bio && <p className="text-base text-justify border-t border-white/5 mt-5 pt-3 text-white/50">{mentorProfile.bio}</p>}

                    {(linkedinHandle || xHandle || website) && (
                        <div className="mt-4 flex items-center gap-3">
                            {linkedinHandle && (
                                <a
                                    href={`https://linkedin.com/in/${linkedinHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 bg-white text-black items-center justify-center rounded-md transition-colors hover:text-[#a6ff00]"
                                    aria-label="LinkedIn"
                                >
                                    <FaLinkedinIn size={15} />
                                </a>
                            )}
                            {xHandle && (
                                <a
                                    href={`https://x.com/${xHandle}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 bg-white text-black items-center justify-center rounded-md transition-colors hover:text-[#a6ff00]"
                                    aria-label="X (Twitter)"
                                >
                                    <FaXTwitter size={14} />
                                </a>
                            )}
                            {website && (
                                <a
                                    href={website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-black transition-colors hover:text-[#a6ff00]"
                                    aria-label="Website"
                                >
                                    <FiGlobe size={15} />
                                </a>
                            )}
                        </div>
                    )}

                    {categories.length > 0 && (
                        <div className="mt-5">
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/30">
                                <FiTag size={12} />
                                Categories
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <span
                                        key={cat}
                                        className="inline-flex bg-neutral-900 text-white rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Products */}
                <div className="mt-10 border-t pt-8" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <h2 className="mb-5 text-lg font-bold text-white sm:text-xl">Products</h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {productsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        ) : products.length > 0 ? (
                            products.map((product) => <ProductCard key={product.id} product={product} />)
                        ) : (
                            <EmptyProducts />
                        )}
                    </div>
                </div>
            </div>

            {showBookModal && (
                <BookMentorshipModal
                    mentorName={mentorName}
                    mentorAvatar={mentorAvatar}
                    isSubmitting={isBooking}
                    errorMessage={bookingError}
                    onClose={handleCloseBookModal}
                    onSubmit={handleBookingSubmit}
                />
            )}

            <PoweredByBadge />
        </div>
    );
};

export default PublicProfile;