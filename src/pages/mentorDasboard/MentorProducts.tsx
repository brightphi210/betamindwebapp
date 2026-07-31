import { useState } from "react";
import { BsStarFill } from "react-icons/bs";
import {
    FiBookOpen,
    FiCheckCircle,
    FiCopy,
    FiExternalLink,
    FiImage,
    FiLink,
    FiPlayCircle,
    FiPlus,
    FiShare2,
    FiShoppingBag,
    FiTag,
    FiX,
} from "react-icons/fi";
import { Link, useOutletContext } from "react-router-dom";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGetMentorDigitalProduct } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// If Explore.tsx is reachable from here, prefer importing these instead of
// redeclaring them, so the two pages never drift apart:
// import { type ApiDigitalProduct } from "../Explore";

type ProductType = "Course" | "Book";
type ProductStatus = "published" | "draft";

// Shape returned by the digital-products endpoint — mirrors Explore.tsx's
// ApiDigitalProduct exactly, since it's the same hook/response.
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

// Card-friendly shape this page renders — same fields the old MOCK_PRODUCTS
// had, just sourced from the API now instead of being hardcoded.
type Product = {
    id: string;
    type: ProductType;
    title: string;
    price: number;
    thumbnail: string | null;
    status: ProductStatus;
    sold: number;
    rating: number;
    link: string;
    description?: string;
};

const mapApiProductToMentorProduct = (p: ApiDigitalProduct): Product => ({
    id: p.id,
    type: p.product_type === "course" ? "Course" : "Book",
    title: p.title,
    price: Number(p.price) || 0,
    thumbnail: p.cover_image,
    status: p.is_published ? "published" : "draft",
    // Not returned by this endpoint yet — default to 0 until the API exposes them.
    sold: 0,
    rating: 0,
    link: p.link,
    description: p.description,
});

const STATUS_STYLES: Record<ProductStatus, { color: string; bg: string; label: string }> = {
    published: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Published" },
    draft: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Draft" },
};

// ---------- Product card ----------

const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => {
    const statusStyle = STATUS_STYLES[product.status];
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="flex cursor-pointer flex-col overflow-hidden rounded-xl text-left transition-colors hover:bg-white/[0.03]"
            style={{ background: cardBg, border: cardBorder }}
        >
            <div className="relative">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-40 w-full object-cover sm:h-48"
                    />
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
                <span
                    className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={{ background: statusStyle.bg, color: statusStyle.color, backdropFilter: "blur(4px)" }}
                >
                    {statusStyle.label}
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
        </div>
    );
};

const ProductCardSkeleton: React.FC = () => (
    <div
        className="flex flex-col overflow-hidden rounded-xl animate-pulse"
        style={{ background: cardBg, border: cardBorder }}
    >
        <div className="h-40 w-full bg-white/5 sm:h-48" />
        <div className="flex flex-col gap-2.5 p-4 sm:p-5">
            <div className="h-4 w-3/4 rounded bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-white/5" />
        </div>
    </div>
);

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <Link
        to={'/dashboard/mentor/product/create'}
        className="col-span-full flex flex-col items-center justify-center rounded-xl px-4 py-14 text-center"
        style={{ background: cardBg, border: "1px dashed rgba(255,255,255,0.1)" }}
    >
        <FiShoppingBag size={22} className="mb-3 text-white/20" />
        <p className="mb-4 text-sm text-white/40">You haven't listed any courses or books yet.</p>
        <Button variant="green" onClick={onCreate}>
            <span className="flex items-center gap-2">
                <FiPlus size={15} />
                Create Your First Product
            </span>
        </Button>
    </Link>
);

// ---------- Product details drawer ----------

const ProductDrawer: React.FC<{
    product: Product;
    onClose: () => void;
}> = ({ product, onClose }) => {
    const { addToast } = useGlobalContext();
    const [copied, setCopied] = useState(false);
    const statusStyle = STATUS_STYLES[product.status];

    const handleShare = async () => {
        if (!product.link) return;
        try {
            if (navigator.share) {
                await navigator.share({ title: product.title, url: product.link });
                return;
            }
            await navigator.clipboard.writeText(product.link);
            setCopied(true);
            addToast("Link copied to clipboard", "success");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
                addToast("Could not copy link. Please try again.", "error");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/65 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="relative flex h-full w-full max-w-md flex-col overflow-y-auto shadow-2xl animate-[slideIn_0.25s_ease-out]"
                style={{ background: "#0a0d09", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
                role="dialog"
                aria-modal="true"
                aria-label="Product details"
            >
                <div className="flex items-center justify-between px-5 pt-5">
                    <h3 className="text-lg font-bold text-white">Product Details</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="px-5 pb-6 pt-4">
                    <div className="relative overflow-hidden rounded-xl">
                        {product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.title} className="h-52 w-full object-cover" />
                        ) : (
                            <div
                                className="flex h-52 w-full items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.03)" }}
                            >
                                <FiImage size={28} className="text-white/15" />
                            </div>
                        )}
                        <span
                            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold"
                            style={{ background: "rgba(0,0,0,0.55)", color: "#fff", backdropFilter: "blur(4px)" }}
                        >
                            {product.type === "Course" ? <FiPlayCircle size={13} /> : <FiBookOpen size={13} />}
                            {product.type}
                        </span>
                        <span
                            className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                            style={{ background: statusStyle.bg, color: statusStyle.color, backdropFilter: "blur(4px)" }}
                        >
                            {statusStyle.label}
                        </span>
                    </div>

                    <h2 className="mb-1 mt-4 break-words text-xl font-bold text-white">{product.title}</h2>

                    <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/50">
                        <span className="font-bold text-white">${product.price}</span>
                        <span>{product.sold} sold</span>
                        {product.rating > 0 ? (
                            <span className="flex items-center gap-1">
                                <BsStarFill size={12} className="fill-amber-400 text-amber-400" />
                                {product.rating}
                            </span>
                        ) : (
                            <span className="text-white/30">No ratings yet</span>
                        )}
                    </div>

                    {product.description && (
                        <div className="mb-5">
                            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/30">
                                <FiTag size={12} />
                                About this {product.type.toLowerCase()}
                            </p>
                            <p className="text-sm leading-relaxed text-white/60">{product.description}</p>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/30">
                            {product.type === "Course" ? "Course Link" : "Book Link"}
                        </p>
                        {product.link ? (
                            <div
                                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/70"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <FiLink size={14} className="shrink-0 text-white/30" />
                                <span className="truncate">{product.link}</span>
                            </div>
                        ) : (
                            <p
                                className="rounded-lg px-3 py-2.5 text-sm text-white/30"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.08)" }}
                            >
                                No link added yet
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row">
                        <Button
                            variant="green"
                            className="flex-1"
                            disabled={!product.link}
                            onClick={() => {
                                void handleShare();
                            }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {copied ? <FiCheckCircle size={15} /> : <FiShare2 size={15} />}
                                {copied ? "Copied!" : "Share Link"}
                            </span>
                        </Button>

                        {product.link && (
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white/70 transition-colors hover:bg-white/[0.04]"
                                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                            >
                                <FiExternalLink size={14} />
                                Open Link
                            </a>
                        )}
                    </div>

                    {product.link && (
                        <button
                            type="button"
                            onClick={() => {
                                void handleShare();
                            }}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/70"
                        >
                            <FiCopy size={12} />
                            Copy raw link instead
                        </button>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

// ---------- Page ----------

const MentorProducts = () => {
    useOutletContext<MentorDashboardContext>();
    const { digitalProduct, isLoading } = useGetMentorDigitalProduct();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const rawProducts: ApiDigitalProduct[] = Array.isArray(digitalProduct?.data)
        ? digitalProduct.data
        : digitalProduct?.data?.results ?? [];

    const myRawProducts = rawProducts;

    const products: Product[] = myRawProducts.map(mapApiProductToMentorProduct);

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Products</h2>
                    <p className="text-sm text-white/40">Manage the courses and books you sell to mentees.</p>
                </div>
                {products.length > 0 && (
                    <Link to={'/dashboard/mentor/product/create'}>
                        <Button variant="green">
                            <span className="flex items-center gap-2">
                                <FiPlus size={15} />
                                Create Product
                            </span>
                        </Button>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
                    ))
                ) : (
                    <EmptyState onCreate={() => { }} />
                )}
            </div>

            {selectedProduct && (
                <ProductDrawer product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            )}
        </div>
    );
};

export default MentorProducts;