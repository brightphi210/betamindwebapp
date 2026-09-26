import React, { useRef, useState } from "react";
import {
    FiCamera,
    FiChevronDown,
    FiDollarSign,
    FiEye,
    FiGrid,
    FiImage,
    FiLayers,
    FiLink,
    FiLoader,
    FiPackage,
    FiTag,
    FiType,
    FiX,
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useCreateDigitalProduct } from "../../hooks/mutations/allMutation";
import { useGlobalContext } from "../../providers/GlobalContext";
import type { ProductType } from "../userDashboard/MentorProductSuccess";
import MentorProductSuccess from "../userDashboard/MentorProductSuccess";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// ---------- Types ----------

type Step = "form" | "success";

const PRODUCT_TYPES: ProductType[] = ["Book", "Course", "Manual", "Template", "Workbook", "Toolkit"];

const PRODUCT_CATEGORIES = [
    "Technology",
    "Design",
    "Business",
    "Marketing",
    "Finance",
    "Career Growth",
    "Health & Wellness",
    "Personal Development",
    "Education",
];

const isTextEmpty = (text: string) => !text || text.trim().length === 0;

const formatPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return "Free";
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

// ---------- API error parsing ----------

const FIELD_LABELS: Record<string, string> = {
    title: "Title",
    price: "Price",
    link: "Access link",
    description: "Description",
    category: "Category",
    cover_image: "Thumbnail",
    product_type: "Product type",
};

function parseProductError(error: any): string {
    const data = error?.response?.data;
    if (!data) return "Could not create product. Please try again.";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    for (const [field, value] of Object.entries(data)) {
        const msg: string | null = Array.isArray(value)
            ? (value[0] as string)
            : typeof value === "string"
                ? value
                : null;
        if (msg) {
            const label = field === "non_field_errors" ? "" : `${FIELD_LABELS[field] ?? field}: `;
            return `${label}${msg}`;
        }
    }
    return "Could not create product. Please try again.";
}

// ---------- Small building blocks ----------

const SectionLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
    <div className="mb-2">
        <p className="text-sm font-semibold text-white">{children}</p>
        {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
    </div>
);

const IconInputRow: React.FC<{
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    subtext?: string;
    inputMode?: "text" | "numeric";
}> = ({ icon, value, onChange, placeholder, subtext, inputMode }) => (
    <div className="w-full rounded-lg px-4 py-3.5" style={{ background: cardBg, border: cardBorder }}>
        <div className="flex items-center gap-3">
            <span className="text-white/40 shrink-0">{icon}</span>
            <input
                value={value}
                inputMode={inputMode}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
            />
        </div>
        {subtext && <p className="text-white/30 text-xs mt-1 ml-7">{subtext}</p>}
    </div>
);

const SelectRow: React.FC<{
    icon: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: readonly string[];
}> = ({ icon, value, onChange, placeholder, options }) => (
    <div className="w-full rounded-lg px-4 py-3.5" style={{ background: cardBg, border: cardBorder }}>
        <div className="flex items-center gap-3">
            <span className="text-white/40 shrink-0">{icon}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`flex-1 cursor-pointer appearance-none bg-transparent text-sm outline-none ${value ? "text-white" : "text-white/30"
                    }`}
            >
                <option value="" disabled className="bg-neutral-900 text-white/50">
                    {placeholder}
                </option>
                {options.map((opt) => (
                    <option key={opt} value={opt} className="bg-neutral-900 text-white">
                        {opt}
                    </option>
                ))}
            </select>
            <FiChevronDown size={16} className="pointer-events-none shrink-0 text-white/40" />
        </div>
    </div>
);

const TextAreaField: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    rows?: number;
    maxLength?: number;
}> = ({ value, onChange, placeholder, rows = 5, maxLength }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none"
        style={{ background: cardBg, border: cardBorder }}
    />
);

const TextDisplay: React.FC<{ text: string }> = ({ text }) => (
    <p className="whitespace-pre-wrap text-sm text-white/60 leading-relaxed">{text}</p>
);

// ---------- Preview modal ----------

const ProductPreviewModal: React.FC<{
    type: string;
    category: string;
    title: string;
    price: string;
    link: string;
    description: string;
    thumbnail: string | null;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ type, category, title, price, link, description, thumbnail, isSubmitting, onClose, onConfirm }) => (
    <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
            className="w-full max-w-xl rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
            style={{
                background: "rgba(10,13,9,0.55)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between p-6 pb-0 shrink-0">
                <div>
                    <h3 className="text-white text-xl font-black mb-1">Preview</h3>
                    <p className="text-white/40 text-xs">This is how mentees will see it before purchase.</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white shrink-0"
                >
                    <FiX size={18} />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(166,255,0,0.12)", color: "#a6ff00" }}
                    >
                        <FiPackage size={12} />
                        {type}
                    </span>
                    <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                    >
                        <FiGrid size={12} />
                        {category}
                    </span>
                </div>

                {thumbnail ? (
                    <img src={thumbnail} alt={title} className="w-full aspect-square rounded-xl mb-5 object-cover" />
                ) : (
                    <div
                        className="w-full aspect-square rounded-xl mb-5 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                        <FiImage size={32} className="text-white/20" />
                    </div>
                )}

                <h2 className="text-white text-2xl font-black mb-2 break-words">{title || "Untitled"}</h2>

                <div className="flex items-center gap-2 mb-6">
                    <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold"
                        style={{
                            background: formatPrice(price) === "Free" ? "rgba(255,255,255,0.06)" : "rgba(166,255,0,0.1)",
                            color: formatPrice(price) === "Free" ? "rgba(255,255,255,0.6)" : "#a6ff00",
                        }}
                    >
                        <FiTag size={12} />
                        {formatPrice(price)}
                    </span>
                    {link && (
                        <span
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold truncate max-w-[220px]"
                            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}
                        >
                            <FiLink size={12} />
                            <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
                        </span>
                    )}
                </div>

                <div className="mb-2">
                    <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Description</h3>
                    <TextDisplay text={description} />
                </div>
            </div>

            <div
                className="flex items-center gap-3 p-6 pt-4 shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:bg-white/[0.04] transition-colors disabled:opacity-40"
                    style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                >
                    Back to Edit
                </button>
                <Button variant="green" className="flex-1" disabled={isSubmitting} onClick={onConfirm}>
                    <span className="flex items-center justify-center gap-2">
                        {isSubmitting ? <FiLoader size={15} className="animate-spin" /> : null}
                        {isSubmitting ? "Creating..." : "Create Product"}
                    </span>
                </Button>
            </div>
        </div>
    </div>
);

// ---------- Page ----------

const MentorProductCreate: React.FC = () => {
    useOutletContext<MentorDashboardContext>();
    const { addToast } = useGlobalContext();
    const { mutate, isPending } = useCreateDigitalProduct();

    const [step, setStep] = useState<Step>("form");

    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState<ProductType | "">("");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [showPreview, setShowPreview] = useState(false);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    const isValid = !!(
        type &&
        category &&
        title.trim() &&
        price !== "" &&
        Number(price) >= 0 &&
        link.trim() &&
        !isTextEmpty(description)
    );

    const handleCreate = () => {
        if (!isValid || !type) return;

        const formData = new FormData();
        formData.append("product_type", type.toLowerCase());
        formData.append("category", category);
        formData.append("title", title);
        formData.append("link", link);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("is_published", "false");

        if (thumbnailFile) formData.append("cover_image", thumbnailFile);

        mutate(formData, {
            onSuccess: () => {
                setShowPreview(false);
                setStep("success");
            },
            onError: (error: any) => {
                addToast(parseProductError(error), "error");
            },
        });
    };

    if (step === "success" && type) {
        return <MentorProductSuccess type={type} title={title} />;
    }

    return (
        <div
            className="w-full min-h-screen relative"
            style={{
                background:
                    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
            }}
        >
            <LoadingOverlay visible={isPending} />
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-8">
                    <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Digital Products</h2>
                    <p className="text-sm text-white/40">List a digital product for mentees to purchase.</p>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* Left: thumbnail */}
                    <div className="w-full shrink-0 lg:w-[280px]">
                        <SectionLabel>Thumbnail</SectionLabel>
                        <div
                            className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl group"
                            style={{ border: cardBorder }}
                            onClick={() => thumbnailInputRef.current?.click()}
                        >
                            {thumbnail ? (
                                <img src={thumbnail} alt="Product thumbnail" className="h-full w-full object-cover" />
                            ) : (
                                <div
                                    className="flex h-full w-full flex-col items-center justify-center gap-2"
                                    style={{ background: cardBg }}
                                >
                                    <FiImage size={26} className="text-white/20" />
                                    <p className="text-xs text-white/30">Add thumbnail</p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    thumbnailInputRef.current?.click();
                                }}
                                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow"
                            >
                                <FiCamera size={15} />
                            </button>
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailChange}
                            />
                        </div>
                        {thumbnail && (
                            <button
                                onClick={() => {
                                    setThumbnail(null);
                                    setThumbnailFile(null);
                                    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
                                }}
                                className="mt-2 w-full text-xs text-white/40 transition-colors hover:text-white/70"
                            >
                                Remove image
                            </button>
                        )}
                    </div>

                    {/* Right: form */}
                    <div className="min-w-0 flex-1 space-y-5">
                        <div>
                            <SectionLabel>Product Type</SectionLabel>
                            <SelectRow
                                icon={<FiLayers size={17} />}
                                value={type}
                                onChange={(v) => setType(v as ProductType)}
                                placeholder="Select product type"
                                options={PRODUCT_TYPES}
                            />
                        </div>

                        <div>
                            <SectionLabel>Category</SectionLabel>
                            <SelectRow
                                icon={<FiGrid size={17} />}
                                value={category}
                                onChange={setCategory}
                                placeholder="Select a category"
                                options={PRODUCT_CATEGORIES}
                            />
                        </div>

                        <div>
                            <SectionLabel>Title</SectionLabel>
                            <IconInputRow
                                icon={<FiType size={17} />}
                                value={title}
                                onChange={setTitle}
                                placeholder="e.g. System Design From Scratch"
                            />
                        </div>

                        <div>
                            <SectionLabel>Price (USD)</SectionLabel>
                            <IconInputRow
                                icon={<FiDollarSign size={17} />}
                                value={price}
                                onChange={(v) => setPrice(v.replace(/[^0-9.]/g, ""))}
                                placeholder="e.g. 49 or 0 for free"
                                inputMode="numeric"
                            />
                        </div>

                        <div>
                            <SectionLabel>Access Link</SectionLabel>
                            <IconInputRow
                                icon={<FiLink size={17} />}
                                value={link}
                                onChange={setLink}
                                placeholder="https://drive.google.com/your-product"
                                subtext="Where mentees go to access this product after purchase."
                            />
                        </div>

                        <div>
                            <SectionLabel>Description</SectionLabel>
                            <TextAreaField
                                value={description}
                                onChange={setDescription}
                                placeholder="What will mentees get from this?"
                            />
                        </div>

                        <Button
                            variant="green"
                            className="w-full"
                            disabled={!isValid || isPending}
                            onClick={() => setShowPreview(true)}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FiEye size={15} />
                                Preview Product
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {showPreview && type && (
                <ProductPreviewModal
                    type={type}
                    category={category}
                    title={title}
                    price={price}
                    link={link}
                    description={description}
                    thumbnail={thumbnail}
                    isSubmitting={isPending}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleCreate}
                />
            )}
        </div>
    );
};

export default MentorProductCreate;