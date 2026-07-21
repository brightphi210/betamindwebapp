import { useRef, useState } from "react";
import { BsStarFill } from "react-icons/bs";
import {
    FiBookOpen,
    FiCamera,
    FiCheck,
    FiExternalLink,
    FiImage,
    FiLink,
    FiLoader,
    FiPlayCircle,
    FiPlus,
    FiShoppingBag,
    FiX,
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import { cardBg, cardBorder, fieldClass } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGlobalContext } from "../../providers/GlobalContext";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// TODO: replace with a real products hook (list + create endpoint) once it
// exists. Shape mirrors the public DigitalProduct card used on Explore, plus
// the mentor-only fields (status, sold, link) needed for management here.
type ProductType = "Course" | "Book";
type ProductStatus = "published" | "draft";

type Product = {
    id: string;
    type: ProductType;
    title: string;
    price: number;
    thumbnail: string;
    status: ProductStatus;
    sold: number;
    rating: number;
    link: string;
};

const MOCK_PRODUCTS: Product[] = [
    {
        id: "pr1",
        type: "Course",
        title: "System Design From Scratch",
        price: 129,
        thumbnail: "https://picsum.photos/seed/sysdesign/600/600",
        status: "published",
        sold: 24,
        rating: 4.9,
        link: "https://courses.example.com/system-design-from-scratch",
    },
    {
        id: "pr2",
        type: "Book",
        title: "The Clarity Habit",
        price: 24,
        thumbnail: "https://picsum.photos/seed/claritybook/600/600",
        status: "published",
        sold: 58,
        rating: 4.8,
        link: "https://books.example.com/the-clarity-habit",
    },
    {
        id: "pr3",
        type: "Course",
        title: "Brand Identity Foundations",
        price: 89,
        thumbnail: "https://picsum.photos/seed/brandcourse/600/600",
        status: "draft",
        sold: 0,
        rating: 0,
        link: "",
    },
];

const STATUS_STYLES: Record<ProductStatus, { color: string; bg: string; label: string }> = {
    published: { color: "#a6ff00", bg: "rgba(166,255,0,0.1)", label: "Published" },
    draft: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", label: "Draft" },
};

// ---------- Product card — same visual as Explore's public ProductCard ----------

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const statusStyle = STATUS_STYLES[product.status];
    return (
        <div
            className="flex flex-col overflow-hidden rounded-xl"
            style={{ background: cardBg, border: cardBorder }}
        >
            <div className="relative">
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-40 w-full object-cover sm:h-48"
                />
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

                {product.link ? (
                    <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-[#a6ff00] transition-colors hover:bg-white/[0.04]"
                        style={{ border: "1px solid rgba(166,255,0,.25)" }}
                    >
                        <FiExternalLink size={13} />
                        {product.type === "Course" ? "Open Course Link" : "Open Book Link"}
                    </a>
                ) : (
                    <p className="mt-4 text-center text-xs text-white/30">No link added yet</p>
                )}
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <div
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
    </div>
);

// ---------- Create product modal ----------

type Draft = {
    type: ProductType;
    title: string;
    price: string;
    link: string;
    description: string;
    thumbnail: string | null;
    thumbnailFile: File | null;
};

const emptyDraft: Draft = {
    type: "Course",
    title: "",
    price: "",
    link: "",
    description: "",
    thumbnail: null,
    thumbnailFile: null,
};

const CreateProductModal: React.FC<{
    onClose: () => void;
    onCreate: (product: Product) => void;
}> = ({ onClose, onCreate }) => {
    const { addToast } = useGlobalContext();
    const thumbnailInputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = !!(draft.title && draft.price && Number(draft.price) > 0 && draft.link);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setDraft((d) => ({ ...d, thumbnail: URL.createObjectURL(file), thumbnailFile: file }));
    };

    const handleCreate = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 900));

            onCreate({
                id: `pr_${Date.now()}`,
                type: draft.type,
                title: draft.title,
                price: Number(draft.price) || 0,
                thumbnail: draft.thumbnail || "https://picsum.photos/seed/newproduct/600/600",
                status: "draft",
                sold: 0,
                rating: 0,
                link: draft.link,
            });
            addToast("Product created", "success");
            onClose();
        } catch (error: any) {
            addToast(error?.response?.data?.message || "Could not create product. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 shadow-2xl"
                style={{
                    background: "rgba(10,13,9,0.55)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Create Product</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:text-white"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-white">Type</p>
                        <div className="flex gap-2">
                            {(["Course", "Book"] as ProductType[]).map((type) => {
                                const active = draft.type === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setDraft((d) => ({ ...d, type }))}
                                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-[#a6ff00] text-black" : "text-white/60 hover:text-white"
                                            }`}
                                        style={active ? undefined : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        {type === "Course" ? <FiPlayCircle size={14} /> : <FiBookOpen size={14} />}
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold text-white">Thumbnail</p>
                        <div
                            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            {draft.thumbnail ? (
                                <img src={draft.thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
                            ) : (
                                <FiImage size={24} className="text-white/20" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#a6ff00] hover:underline"
                        >
                            <FiCamera size={13} />
                            {draft.thumbnail ? "Change image" : "Upload image"}
                        </button>
                        <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailChange}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                        <input
                            value={draft.title}
                            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                            placeholder="e.g. System Design From Scratch"
                            className={fieldClass}
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Price (USD)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={draft.price}
                            onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value.replace(/[^0-9.]/g, "") }))}
                            placeholder="e.g. 49"
                            className={fieldClass}
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">
                            {draft.type === "Course" ? "Course Link" : "Book Link"}
                        </label>
                        <div className="flex items-center gap-3">
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/40"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <FiLink size={15} />
                            </div>
                            <input
                                value={draft.link}
                                onChange={(e) => setDraft((d) => ({ ...d, link: e.target.value }))}
                                placeholder={
                                    draft.type === "Course"
                                        ? "https://yourplatform.com/course-name"
                                        : "https://yourstore.com/book-name"
                                }
                                className={`${fieldClass} flex-1`}
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-white/40">
                            Where mentees go to {draft.type === "Course" ? "take the course" : "get the book"} after
                            purchase — e.g. a Teachable/Udemy link, or an Amazon/Gumroad page.
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-white">Description</label>
                        <textarea
                            value={draft.description}
                            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                            placeholder="What will mentees get from this?"
                            rows={3}
                            className={`${fieldClass} resize-none`}
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                        />
                    </div>
                </div>

                <Button
                    variant="green"
                    className="mt-6 w-full"
                    disabled={!isValid || isSubmitting}
                    onClick={() => {
                        void handleCreate();
                    }}
                >
                    <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? <FiLoader size={15} className="animate-spin" /> : <FiCheck size={15} />}
                        {isSubmitting ? "Creating..." : "Create Product"}
                    </span>
                </Button>
            </div>
        </div>
    );
};

const MentorProducts = () => {
    useOutletContext<MentorDashboardContext>();
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
    const [showCreateModal, setShowCreateModal] = useState(false);

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Products</h2>
                    <p className="text-sm text-white/40">Manage the courses and books you sell to mentees.</p>
                </div>
                {products.length > 0 && (
                    <Button variant="green" onClick={() => setShowCreateModal(true)}>
                        <span className="flex items-center gap-2">
                            <FiPlus size={15} />
                            Create Product
                        </span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.length > 0 ? (
                    products.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                    <EmptyState onCreate={() => setShowCreateModal(true)} />
                )}
            </div>

            {showCreateModal && (
                <CreateProductModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={(product) => setProducts((prev) => [product, ...prev])}
                />
            )}
        </div>
    );
};

export default MentorProducts;