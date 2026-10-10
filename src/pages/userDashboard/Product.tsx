import React, { useState } from "react";
import { FaGlobe, FaLinkedin, FaTwitter } from "react-icons/fa";
import {
    FiArrowLeft,
    FiBookOpen,
    FiBriefcase,
    FiCheckCircle,
    FiDollarSign,
    FiExternalLink,
    FiGrid,
    FiLayers,
    FiLink,
    FiPackage,
    FiPlayCircle,
    FiUser,
} from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import LoadingOverlay from "../../component/LoadingOverlay";
import PoweredByBadge from "../../component/PowereByBadge";
import PublicNavbar from "../../component/PublicNavbar";
import Button from "../../component/ui/Button";
import { usePurchaseProducts } from "../../hooks/mutations/allMutation";
import { useGetSingleDigitalProduct } from "../../hooks/queries/allQueriess";
import { formatNaira } from "../../utils/currency";

type ApiCourseModule = {
    title: string;
    description: string;
};

type ApiProductType = "course" | "book" | "manual" | "template" | "workbook" | "toolkit";

type ApiSocialLinks = {
    linkedin?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
};

type ApiCreator = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
    nick_name?: string;
    occupation?: string;
    bio?: string;
    country?: string;
    city?: string;
    social_link?: ApiSocialLinks;
};

type ApiProduct = {
    id: string;
    mentor: ApiCreator;
    user_name: string;
    link: string;
    product_type: ApiProductType;
    category?: string;
    title: string;
    description: string;
    course_content: ApiCourseModule[] | null;
    cover_image: string | null;
    price: string;
    is_published: boolean;
    video: string | null;
    summary: string | null;
    created_at: string;
};

const formatPrice = (price: string) => formatNaira(price, "Free");

const toTitleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const RichText: React.FC<{ html: string }> = ({ html }) => (
    <div
        className="rich-text-content overflow-visible text-sm leading-relaxed text-white/60 wrap-break-word"
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

const ProductNotFound: React.FC = () => (
    <div
        className="w-full min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
            background:
                "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
        }}
    >
        <PublicNavbar />
        <h1 className="text-white text-2xl font-black mb-2">Product Not Found</h1>
        <p className="text-white/40 text-sm mb-8">We couldn't find the item you're looking for.</p>
        <Link
            to="/dashboard/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-transform hover:scale-[1.02]"
            style={{ background: "#a6ff00" }}
        >
            <FiArrowLeft size={16} />
            Back to Explore
        </Link>
        <PoweredByBadge />
    </div>
);

const StatPill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
    icon,
    label,
    value,
}) => (
    <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
        <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(166,255,0,0.1)", color: "#a6ff00" }}
        >
            {icon}
        </div>
        <div className="min-w-0">
            <p className="text-sm font-bold text-white wrap-break-word">{value}</p>
            <p className="text-white/40 text-xs">{label}</p>
        </div>
    </div>
);

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
    linkedin: <FaLinkedin size={14} />,
    twitter: <FaTwitter size={14} />,
    website: <FaGlobe size={14} />,
    instagram: <FaGlobe size={14} />,
};

const CreatorCard: React.FC<{ creator: ApiCreator }> = ({ creator }) => {
    const fullName = creator.nick_name?.trim() || `${creator.first_name} ${creator.last_name}`.trim();
    const socialEntries = Object.entries(creator.social_link ?? {}).filter(
        (entry): entry is [string, string] => !!entry[1]
    );
    const location = [creator.city, creator.country].filter(Boolean).join(", ");

    return (
        <div
            className="rounded-2xl p-4 sm:p-5 mb-8 flex items-center gap-4"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
            <div
                className="w-14 h-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
                {creator.avatar ? (
                    <img src={creator.avatar} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                    <FiUser size={20} className="text-white/30" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-white/40 text-[11px] uppercase tracking-wide mb-0.5">Creator</p>
                <p className="text-white text-sm font-bold wrap-break-word">{fullName || "Unknown creator"}</p>

                {(creator.occupation || location) && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/40 wrap-break-word">
                        {creator.occupation && (
                            <>
                                <FiBriefcase size={12} className="shrink-0" />
                                <span className="wrap-break-word">{creator.occupation}</span>
                            </>
                        )}
                        {creator.occupation && location && <span className="shrink-0">·</span>}
                        {location && <span className="wrap-break-word">{location}</span>}
                    </p>
                )}

                {socialEntries.length > 0 && (
                    <div className="flex items-center gap-2 mt-2.5">
                        {socialEntries.map(([key, url]) => (
                            <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={toTitleCase(key)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white/50 transition-colors hover:text-white hover:bg-white/10"
                                style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                                {SOCIAL_ICONS[key] ?? <FiLink size={13} />}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Product: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { product: response, isLoading, isError } = useGetSingleDigitalProduct(id);
    const product: ApiProduct | undefined = response?.data;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const { mutate: purchaseProduct, isPending: isPurchasing } = usePurchaseProducts();

    const handleSubmit = () => {
        if (!product) return;

        if (!name.trim() || !email.trim()) {
            toast.error("Please enter your full name and email address.");
            return;
        }

        const numericPrice = Number(product.price) || 0;
        const amount = String(Math.round(numericPrice * 100));

        const payload = {
            email: email.trim(),
            name: name.trim(),
            product: product.id,
            amount,
        };

        purchaseProduct(payload, {
            onSuccess: (response: any) => {
                const authUrl =
                    response?.data?.authorization_url ||
                    response?.authorization_url;

                if (authUrl) {
                    window.location.href = authUrl;
                    return;
                }

                toast.success("Purchase initiated successfully.");
            },
            onError: (error: any) => {
                const data = error?.response?.data;

                let message =
                    data?.message ||
                    data?.detail ||
                    error?.response?.detail ||
                    "Something went wrong while creating this purchase.";

                if (data && typeof data === "object" && !data.message && !data.detail) {
                    const firstField = Object.keys(data)[0];
                    const fieldErrors = data[firstField];
                    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                        message = fieldErrors[0];
                    } else if (typeof fieldErrors === "string") {
                        message = fieldErrors;
                    }
                }

                toast.error(message);
            },
        });
    };

    if (isLoading) {
        return (
            <div
                className="w-full min-h-screen relative"
                style={{
                    background:
                        "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
                }}
            >
                <PublicNavbar />
                <LoadingOverlay visible />
                <PoweredByBadge />
            </div>
        );
    }

    if (isError || !product) return <ProductNotFound />;

    const isCourse = product.product_type === "course";
    const typeLabel = toTitleCase(product.product_type);
    const price = formatPrice(product.price);
    const viewLabel = isCourse ? "View Course" : `View ${typeLabel}`;

    const scrollToPreview = () => {
        document.getElementById("product-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div
            className="w-full min-h-screen"
            style={{
                background:
                    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
            }}
        >
            <ToastContainer theme="dark" />
            <PublicNavbar />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 pt-28">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
                    {/* Left */}
                    <div className="min-w-0">
                        <div
                            className="rounded-2xl overflow-hidden mb-6"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            {product.cover_image ? (
                                <img
                                    src={product.cover_image}
                                    alt={product.title}
                                    className="w-full aspect-square object-cover"
                                />
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center">
                                    {isCourse ? (
                                        <FiPlayCircle size={40} className="text-white/15" />
                                    ) : product.product_type === "book" ? (
                                        <FiBookOpen size={40} className="text-white/15" />
                                    ) : (
                                        <FiPackage size={40} className="text-white/15" />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ background: "rgba(166,255,0,0.1)", color: "#a6ff00" }}
                            >
                                {isCourse ? (
                                    <FiPlayCircle size={12} />
                                ) : product.product_type === "book" ? (
                                    <FiBookOpen size={12} />
                                ) : (
                                    <FiPackage size={12} />
                                )}
                                {typeLabel}
                            </span>

                            {product.category && (
                                <span
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
                                >
                                    <FiGrid size={12} />
                                    {product.category}
                                </span>
                            )}

                            {product.video && (
                                <button
                                    type="button"
                                    onClick={scrollToPreview}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:bg-white/10"
                                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)" }}
                                >
                                    <FiPlayCircle size={12} />
                                    Watch preview
                                </button>
                            )}

                            {product.link && (
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors hover:bg-white/10"
                                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)" }}
                                >
                                    <FiExternalLink size={12} />
                                    {viewLabel}
                                </a>
                            )}
                        </div>

                        <h1 className="text-white text-2xl sm:text-3xl font-black mb-5 wrap-break-word">{product.title}</h1>

                        {product.mentor && <CreatorCard creator={product.mentor} />}

                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <StatPill icon={<FiDollarSign size={16} />} label="Pricing" value={price} />
                            <StatPill
                                icon={<FiLayers size={16} />}
                                label="Content"
                                value={
                                    isCourse
                                        ? `${product.course_content?.length ?? 0} module${product.course_content?.length === 1 ? "" : "s"}`
                                        : `1 ${typeLabel}`
                                }
                            />
                        </div>

                        {product.video && (
                            <div id="product-preview" className="scroll-mt-24 mb-8 bg-[rgba(255,255,255,0.03)] rounded-md p-2">
                                <div
                                    className="rounded-lg overflow-hidden"
                                    style={{ border: "1px solid rgba(255,255,255,0.08)", aspectRatio: "16 / 9" }}
                                >
                                    <video
                                        src={product.video}
                                        poster={product.cover_image ?? undefined}
                                        controls
                                        playsInline
                                        className="w-full h-full bg-black"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Description</h3>
                            <RichText html={product.description} />
                        </div>

                        {isCourse ? (
                            <div>
                                <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                    Course Content
                                    {product.course_content?.length
                                        ? ` · ${product.course_content.length} module${product.course_content.length === 1 ? "" : "s"}`
                                        : ""}
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {(product.course_content ?? []).map((m, i) => (
                                        <div
                                            key={`${m.title}-${i}`}
                                            className="rounded-xl p-4 min-w-0"
                                            style={{
                                                background: "rgba(255,255,255,0.02)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5 mb-2 min-w-0">
                                                <span
                                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                                    style={{ background: "#a6ff00" }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <p className="min-w-0 text-sm font-semibold text-white wrap-break-word">
                                                    {m.title || `Module ${i + 1}`}
                                                </p>
                                            </div>
                                            <RichText html={m.description} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            product.summary && (
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">
                                        Overview
                                    </h3>
                                    <div
                                        className="rounded-xl p-4 min-w-0"
                                        style={{
                                            background: "rgba(255,255,255,0.02)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        <RichText html={product.summary} />
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Right – purchase panel */}
                    <div
                        className="rounded-2xl p-6 sm:p-8 lg:sticky lg:top-8 min-w-0"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                        <h2 className="text-white text-lg sm:text-xl font-bold mb-1">Purchase {product.title}</h2>
                        <p className="text-white/40 text-sm mb-6">Complete the quick form below to proceed</p>

                        <div className="flex flex-col gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#a6ff00]/50 transition-colors"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#a6ff00]/50 transition-colors"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
                            />
                        </div>

                        <p className="text-white font-bold text-sm mb-3">Summary</p>

                        <div
                            className="rounded-xl overflow-hidden mb-6"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="wrap-break-word text-sm text-white/70">{product.title}</span>
                                <span className="text-white text-sm font-semibold shrink-0">{price}</span>
                            </div>
                            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                            <div className="flex items-center justify-between px-4 py-3.5">
                                <span className="text-white font-bold text-sm">Total</span>
                                <span className="font-bold text-sm" style={{ color: "#a6ff00" }}>
                                    {price}
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="green"
                            className="w-full py-3 text-sm"
                            onClick={handleSubmit}
                            disabled={isPurchasing}
                        >
                            {isPurchasing ? "Processing..." : "Continue to payment"}
                        </Button>

                        <p className="flex items-center justify-center gap-1.5 text-white/30 text-xs mt-4">
                            <FiCheckCircle size={12} />
                            Secure checkout, instant access after payment
                        </p>
                    </div>
                </div>
            </div>

            <PoweredByBadge />

            <style>{`
        .rich-text-content {
          overflow: visible;
          overflow-wrap: anywhere;
          word-break: break-word;
          white-space: normal;
        }
        .rich-text-content * { max-width: 100%; }
        .rich-text-content p { margin: 0 0 0.75em; }
        .rich-text-content p:last-child { margin-bottom: 0; }
        .rich-text-content strong { color: rgba(255,255,255,0.85); }
        .rich-text-content a { color: #a6ff00; text-decoration: underline; }
        .rich-text-content ul, .rich-text-content ol { margin: 0 0 0.75em; padding-left: 1.25em; }
        .rich-text-content li { margin-bottom: 0.25em; }
        .rich-text-content blockquote {
          border-left: 3px solid rgba(166,255,0,0.4);
          padding-left: 0.75em;
          margin: 0 0 0.75em;
          color: rgba(255,255,255,0.5);
        }
        .rich-text-content h1, .rich-text-content h2, .rich-text-content h3 {
          color: #fff;
          font-weight: 700;
          margin: 0.5em 0 0.4em;
        }
      `}</style>
        </div>
    );
};

export default Product;