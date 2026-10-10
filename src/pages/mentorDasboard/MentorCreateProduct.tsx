import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    FiCamera,
    FiChevronDown,
    FiEye,
    FiGrid,
    FiImage,
    FiLayers,
    FiLink,
    FiLoader,
    FiPackage,
    FiPlus,
    FiTag,
    FiTrash2,
    FiType,
    FiX
} from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useCreateDigitalProduct, useEditDigitalProduct } from "../../hooks/mutations/allMutation";
import { useGetSingleDigitalProduct } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";
import { compressImage, formatBytes } from "../../utils/compressimage";
import { formatNaira } from "../../utils/currency";
import {
    canUploadOriginal,
    getErrorMessage,
    getErrorMessages,
    isFileReadable,
    toStableFile,
    validateImageFile,
} from "../../utils/uploadhelpers";
import type { ProductType } from "../userDashboard/MentorProductSuccess";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// Where the "Back to Dashboard" button on the success screen goes.
// Change this to your mentor dashboard route.
const DASHBOARD_PATH = "dashboard/mentor/products";

// ---------- Types ----------

type Step = "form" | "success";

type CourseModuleDraft = {
    id: string; // local-only key for React lists, not sent to the API
    title: string;
    description: string; // Quill HTML
};

type FormError = { field?: string; message: string };

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

// Quill leaves behind "<p><br></p>" for an empty editor, so a plain
// string-empty check isn't enough — strip tags before checking length.
const isTextEmpty = (html: string) => {
    if (!html) return true;
    const stripped = html.replace(/<(.|\n)*?>/g, "").trim();
    return stripped.length === 0;
};

const formatPrice = (price: string) => formatNaira(price, "Free");

const formatPriceInput = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    if (!cleaned) return "";

    const [whole, decimals = ""] = cleaned.split(".");
    const formattedWhole = whole.replace(/^0+(?=\d)/, "") || "0";
    const formattedInt = Number(formattedWhole).toLocaleString("en-NG");

    if (decimals !== "") {
        return `${formattedInt}.${decimals.slice(0, 2)}`;
    }

    return formattedInt;
};

const formatPriceForApi = (value: string) => value.replace(/,/g, "");

const makeModuleId = () => Math.random().toString(36).slice(2, 10);

// A fuller, more flexible toolbar: headings, font size, color/background,
// alignment, sub/superscript, indent, blockquote, code, lists, link, image.
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
    ],
};

// A lighter toolbar for per-module descriptions inside a course — keeps the
// UI from feeling cluttered when there are several modules on screen at once.
const moduleQuillModules = {
    toolbar: [
        [{ header: [3, 4, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link"],
        ["clean"],
    ],
};

// Labels used when turning backend field names into readable text.
// The backend's own message text is never changed — only the field name.
const PRODUCT_FIELD_LABELS: Record<string, string> = {
    title: "Title",
    price: "Price",
    link: "Access link",
    description: "Description",
    category: "Category",
    cover_image: "Thumbnail",
    image: "Thumbnail",
    product_type: "Product type",
    course_content: "Course content",
    is_published: "Publish status",
};

// ---------- Success animation ----------

const BURST_COLORS = ["#a6ff00", "#7ee6c0", "#ff8fb0", "#8f8fff"];

const SuccessBurst: React.FC = () => {
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }, (_, i) => {
                const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
                const dist = 95 + Math.random() * 55;
                return {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    size: 6 + Math.random() * 6,
                    color: BURST_COLORS[i % BURST_COLORS.length],
                    delay: 0.55 + Math.random() * 0.12,
                    round: i % 2 === 0,
                };
            }),
        []
    );

    return (
        <div className="relative flex h-30 w-44 items-center justify-center">
            {particles.map((p, i) => (
                <span
                    key={i}
                    className="sb-particle absolute"
                    style={{
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        borderRadius: p.round ? "9999px" : "2px",
                        animationDelay: `${p.delay}s`,
                        ["--x" as string]: `${p.x}px`,
                        ["--y" as string]: `${p.y}px`,
                    }}
                />
            ))}

            <svg viewBox="0 0 100 100" className="sb-pop h-24 w-32">
                <circle className="sb-fill" cx="50" cy="50" r="44" fill="rgba(166,255,0,0.12)" />
                <circle
                    className="sb-ring"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#a6ff00"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <path
                    className="sb-check"
                    d="M30 52 L44 66 L71 36"
                    pathLength={60}
                    fill="none"
                    stroke="#a6ff00"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            <style>{`
                .sb-ring {
                    stroke-dasharray: 277;
                    stroke-dashoffset: 277;
                    transform: rotate(-90deg);
                    transform-origin: 50% 50%;
                    animation: sbDraw 0.6s ease-out forwards;
                }
                .sb-check {
                    stroke-dasharray: 60;
                    stroke-dashoffset: 60;
                    animation: sbDraw 0.4s ease-out 0.5s forwards;
                }
                .sb-fill {
                    opacity: 0;
                    animation: sbFade 0.4s ease-out 0.5s forwards;
                }
                .sb-pop {
                    animation: sbPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
                }
                .sb-particle {
                    opacity: 0;
                    animation: sbParticle 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }
                @keyframes sbDraw { to { stroke-dashoffset: 0; } }
                @keyframes sbFade { to { opacity: 1; } }
                @keyframes sbPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes sbParticle {
                    0% { opacity: 1; transform: translate(0, 0) scale(0.3) rotate(0deg); }
                    100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(1) rotate(220deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sb-ring, .sb-check, .sb-fill, .sb-pop { animation: none; stroke-dashoffset: 0; opacity: 1; }
                    .sb-particle { display: none; }
                }
            `}</style>
        </div>
    );
};

// ---------- Small building blocks ----------

const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => (
    <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${className}`}
        style={{ background: "rgba(255,255,255,0.12)" }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
    >
        <div
            className="h-full rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${value}%`, background: "#a6ff00" }}
        />
    </div>
);

// Full-screen progress shown while the product is being created/uploaded.
const SubmitProgressModal: React.FC<{
    open: boolean;
    progress: number;
    stage: string;
}> = ({ open, progress, stage }) => {
    if (!open) return null;
    const pct = Math.round(progress);
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            role="alertdialog"
            aria-live="polite"
            aria-label="Creating product"
        >
            <div
                className="w-full max-w-sm rounded-xl p-10 shadow-2xl"
                style={{
                    background: 'rgba(10,12,9,0.98)',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h3 className="text-white text-lg font-black">
                            {pct >= 100 ? 'Event created' : 'Creating your event'}
                        </h3>
                        <p className="text-white/45 text-xs mt-1">{stage}</p>
                    </div>
                    <span className="text-[#a6ff00] text-2xl font-black tabular-nums">
                        {pct}%
                    </span>
                </div>
                <ProgressBar value={progress} />
                <p className="text-white/30 text-xs mt-3">
                    Please keep this page open until it finishes.
                </p>
            </div>
        </div>
    );
};

const ErrorList: React.FC<{ errors: FormError[]; title?: string }> = ({
    errors,
    title = "Please fix the following",
}) => {
    if (errors.length === 0) return null;
    return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-300">{title}</p>
            <ul className="space-y-1.5 text-xs text-red-200/90">
                {errors.map(({ field, message }, i) => (
                    <li key={`${field ?? "err"}-${i}`} className="flex gap-2">
                        <span className="mt-0.5 text-red-300">•</span>
                        <span className="min-w-0 break-words">
                            {field && <span className="font-semibold text-red-100">{field}: </span>}
                            {message}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

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

// Renders formatted (HTML) rich text produced by the Quill editor — used both
// in the live preview modal and could be reused wherever description shows up.
const RichTextDisplay: React.FC<{ html: string }> = ({ html }) => (
    <div className="rich-text-content text-sm text-white/60 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
);

// ---------- Course content editor (used only when type === "Course") ----------

const CourseContentEditor: React.FC<{
    modules: CourseModuleDraft[];
    onChange: (modules: CourseModuleDraft[]) => void;
}> = ({ modules, onChange }) => {
    const addModule = () => {
        onChange([...modules, { id: makeModuleId(), title: "", description: "" }]);
    };

    const updateModule = (id: string, patch: Partial<CourseModuleDraft>) => {
        onChange(modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    };

    const removeModule = (id: string) => {
        onChange(modules.filter((m) => m.id !== id));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <SectionLabel hint="Break your course into modules. Each module gets its own title and formatted description.">
                    Course Content
                </SectionLabel>
            </div>

            <div className="flex flex-col gap-4">
                {modules.map((m, i) => (
                    <div
                        key={m.id}
                        className="rounded-xl p-4"
                        style={{ background: "rgba(255,255,255,0.02)", border: cardBorder }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                style={{ background: "#a6ff00" }}
                            >
                                {i + 1}
                            </span>
                            <input
                                value={m.title}
                                onChange={(e) => updateModule(m.id, { title: e.target.value })}
                                placeholder={`Module ${i + 1} title`}
                                className="flex-1 bg-transparent outline-none text-white text-sm font-semibold placeholder-white/30"
                            />
                            <button
                                type="button"
                                onClick={() => removeModule(m.id)}
                                className="p-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                                title="Remove module"
                            >
                                <FiTrash2 size={15} />
                            </button>
                        </div>

                        <div className="quill-dark-wrapper quill-dark-wrapper--compact rounded-lg overflow-hidden" style={{ border: cardBorder }}>
                            <ReactQuill
                                theme="snow"
                                value={m.description}
                                onChange={(v) => updateModule(m.id, { description: v })}
                                modules={moduleQuillModules}
                                placeholder="What does this module cover?"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={addModule}
                className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg py-3 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px dashed rgba(255,255,255,0.15)` }}
            >
                <FiPlus size={14} />
                Add Module
            </button>
        </div>
    );
};

// ---------- Preview modal ----------

const ProductPreviewModal: React.FC<{
    type: string;
    category: string;
    title: string;
    price: string;
    link: string;
    description: string;
    thumbnail: string | null;
    courseModules: CourseModuleDraft[];
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({
    type,
    category,
    title,
    price,
    link,
    description,
    thumbnail,
    courseModules,
    isSubmitting,
    onClose,
    onConfirm,
}) => (
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

                    <div className="mb-6">
                        <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Description</h3>
                        <RichTextDisplay html={description} />
                    </div>

                    {courseModules.length > 0 && (
                        <div>
                            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                                Course Content · {courseModules.length} module{courseModules.length === 1 ? "" : "s"}
                            </h3>
                            <div className="flex flex-col gap-3">
                                {courseModules.map((m, i) => (
                                    <div
                                        key={m.id}
                                        className="rounded-xl p-4"
                                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}
                                    >
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <span
                                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                                style={{ background: "#a6ff00" }}
                                            >
                                                {i + 1}
                                            </span>
                                            <p className="text-white text-sm font-semibold truncate">
                                                {m.title || `Module ${i + 1}`}
                                            </p>
                                        </div>
                                        <RichTextDisplay html={m.description} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { addToast } = useGlobalContext();
    const { mutate, isPending } = useCreateDigitalProduct();
    const isEditMode = Boolean(id);
    const { product } = useGetSingleDigitalProduct(id);
    const { mutate: updateProduct, isPending: isUpdating } = useEditDigitalProduct(id || "");

    const [step, setStep] = useState<Step>("form");

    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState<ProductType | "">("");
    const [category, setCategory] = useState("");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState(""); // Quill HTML
    const [courseModules, setCourseModules] = useState<CourseModuleDraft[]>([]);

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    // Thumbnail compression
    const [thumbnailProgress, setThumbnailProgress] = useState<number | null>(null); // null = not compressing
    const [thumbnailInfo, setThumbnailInfo] = useState<string | null>(null);
    const [thumbnailError, setThumbnailError] = useState<string | null>(null);

    const [showPreview, setShowPreview] = useState(false);

    // Errors
    const [showValidation, setShowValidation] = useState(false); // local field errors appear after a failed attempt
    const [serverErrors, setServerErrors] = useState<string[]>([]);

    // Submit progress modal
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitProgress, setSubmitProgress] = useState(0);
    const [submitStage, setSubmitStage] = useState("Preparing upload…");
    const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const finishRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isCourse = type === "Course";
    const isCompressing = thumbnailProgress !== null;

    const stopTrickle = () => {
        if (trickleRef.current) {
            clearInterval(trickleRef.current);
            trickleRef.current = null;
        }
    };

    useEffect(
        () => () => {
            stopTrickle();
            if (finishRef.current) clearTimeout(finishRef.current);
        },
        []
    );

    // Old server errors no longer apply once the user edits something
    useEffect(() => {
        setServerErrors([]);
    }, [type, category, title, price, link, description, courseModules, thumbnailFile]);

    useEffect(() => {
        if (!product?.data || !isEditMode) return;

        const item = product.data;
        setType((item.product_type?.charAt(0).toUpperCase() + item.product_type?.slice(1)) as ProductType);
        setCategory(item.category || "");
        setTitle(item.title || "");
        setPrice(String(item.price ?? ""));
        setLink(item.link || "");
        setDescription(item.description || "");
        setCourseModules(
            Array.isArray(item.course_content)
                ? item.course_content.map((module: any) => ({
                    id: makeModuleId(),
                    title: module.title || "",
                    description: module.description || "",
                }))
                : []
        );

        if (item.cover_image) {
            setThumbnail(item.cover_image);
        }
    }, [product, isEditMode]);

    const stageFor = (p: number) =>
        p < 15
            ? "Preparing upload…"
            : p < 90
                ? "Uploading product details and thumbnail…"
                : p < 100
                    ? "Finishing up…"
                    : "Done!";

    const startSubmitProgress = () => {
        setSubmitProgress(0);
        setSubmitStage("Preparing upload…");
        setShowSubmitModal(true);
        // Simulated: ease toward 90%, jump to 100% when the API responds.
        stopTrickle();
        trickleRef.current = setInterval(() => {
            setSubmitProgress((p) => {
                const next = p + Math.max(0.4, (90 - p) * 0.06);
                const capped = Math.min(next, 90);
                setSubmitStage(stageFor(capped));
                return capped;
            });
        }, 200);
    };

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        setThumbnailError(null);

        const problem = validateImageFile(file);
        if (problem) {
            setThumbnailError(problem);
            addToast(problem, "error");
            input.value = "";
            return;
        }

        setThumbnailProgress(0);
        setThumbnailInfo(null);
        try {
            // Copy into memory first so mobile browsers can't invalidate the file later
            const stable = await toStableFile(file);
            let finalFile: File = stable;
            try {
                const compressed = await compressImage(stable, {
                    maxDimension: 1600,
                    maxSizeMB: 1,
                    onProgress: setThumbnailProgress,
                });
                finalFile = await toStableFile(compressed);
            } catch (err) {
                console.error("Thumbnail compression failed", err);
                if (!canUploadOriginal(stable)) {
                    const msg = "Could not process this image format. Please choose a JPG, PNG or WebP photo.";
                    setThumbnailError(msg);
                    addToast(msg, "error");
                    return;
                }
                // else: fall back to the in-memory copy of the original
            }
            setThumbnail(URL.createObjectURL(finalFile));
            setThumbnailFile(finalFile);
            setThumbnailInfo(`${formatBytes(file.size)} → ${formatBytes(finalFile.size)}`);
        } catch (err) {
            const msg = getErrorMessage(err);
            setThumbnailError(msg);
            addToast(msg, "error");
        } finally {
            setThumbnailProgress(null);
            input.value = "";
        }
    };

    // ---- Local validation: every problem, with a clear message ----
    const localErrors = useMemo<FormError[]>(() => {
        const errors: FormError[] = [];

        if (!type) errors.push({ field: "Product type", message: "Select a product type." });
        if (!category) errors.push({ field: "Category", message: "Select a category." });
        if (!title.trim()) errors.push({ field: "Title", message: "Title is required." });

        if (price === "") {
            errors.push({ field: "Price", message: "Enter a price (use 0 for free)." });
        } else if (Number.isNaN(Number(price))) {
            errors.push({ field: "Price", message: "Price must be a valid number." });
        } else if (Number(price) < 0) {
            errors.push({ field: "Price", message: "Price cannot be negative." });
        }

        if (!link.trim()) errors.push({ field: "Access link", message: "Access link is required." });
        if (isTextEmpty(description)) errors.push({ field: "Description", message: "Description is required." });

        if (isCourse) {
            if (courseModules.length === 0) {
                errors.push({ field: "Course content", message: "Add at least one module." });
            }
            courseModules.forEach((m, i) => {
                if (!m.title.trim()) {
                    errors.push({ field: `Module ${i + 1}`, message: "Title is required." });
                }
                if (isTextEmpty(m.description)) {
                    errors.push({ field: `Module ${i + 1}`, message: "Description is required." });
                }
            });
        }

        return errors;
    }, [type, category, title, price, link, description, isCourse, courseModules]);

    // What the red box shows: file problem, local validation (after a failed attempt), server errors
    const visibleErrors: FormError[] = [
        ...(thumbnailError ? [{ field: "Thumbnail", message: thumbnailError }] : []),
        ...(showValidation ? localErrors : []),
        ...serverErrors.map((message) => ({ message })),
    ];

    const handlePreview = () => {
        if (isCompressing) return;
        if (localErrors.length > 0) {
            setShowValidation(true);
            const first = localErrors[0];
            addToast(`${first.field}: ${first.message}`, "error");
            return;
        }
        setShowValidation(false);
        setShowPreview(true);
    };

    const handleSuccess = () => {
        stopTrickle();
        setSubmitProgress(100);
        setSubmitStage("Done!");
        // Let the user see 100% before switching screens.
        finishRef.current = setTimeout(() => {
            setShowSubmitModal(false);
            setShowPreview(false);
            setStep("success");
        }, 600);
    };

    // Shows the backend's own error text exactly as the server sent it (plus the HTTP
    // status). Network failures (no server reply) get a clear explanation instead.
    const handleError = (error: any) => {
        stopTrickle();
        setShowSubmitModal(false);
        setSubmitProgress(0);
        setShowPreview(false); // so the error list is visible
        console.error("Error creating product:", error?.response?.status, error?.response?.data ?? error);

        const messages = getErrorMessages(error, "Could not create product. Please try again.", PRODUCT_FIELD_LABELS);
        setServerErrors(messages);
        addToast(messages.join(" • "), "error");
    };

    const handleCreate = async () => {
        if (!type || isPending || isUpdating || isCompressing) return;

        if (localErrors.length > 0) {
            setShowPreview(false);
            setShowValidation(true);
            addToast(`${localErrors[0].field}: ${localErrors[0].message}`, "error");
            return;
        }

        try {
            // Mobile browsers can invalidate picked files; make sure it's still readable.
            if (thumbnailFile && !(await isFileReadable(thumbnailFile))) {
                const msg = "Your thumbnail can no longer be read by the browser. Remove it, pick it again and retry.";
                setShowPreview(false);
                setThumbnailError(msg);
                addToast(msg, "error");
                return;
            }

            const formData = new FormData();
            formData.append("product_type", type.toLowerCase());
            formData.append("category", category);
            formData.append("title", title);
            formData.append("link", link);
            formData.append("description", description);
            formData.append("price", formatPriceForApi(price));
            formData.append("is_published", "false");

            if (isCourse) {
                const payload = courseModules.map((m) => ({ title: m.title, description: m.description }));
                formData.append("course_content", JSON.stringify(payload));
            }

            // thumbnailFile is the compressed, in-memory copy
            if (thumbnailFile) formData.append("cover_image", thumbnailFile);

            // Debug: see exactly what is being sent
            for (const [key, value] of formData.entries()) {
                console.log(
                    "formData >",
                    key,
                    value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value
                );
            }

            startSubmitProgress();

            if (isEditMode) {
                updateProduct(formData, {
                    onSuccess: () => {
                        stopTrickle();
                        setSubmitProgress(100);
                        setSubmitStage("Done!");
                        finishRef.current = setTimeout(() => {
                            setShowSubmitModal(false);
                            setShowPreview(false);
                            navigate(DASHBOARD_PATH);
                        }, 600);
                    },
                    onError: handleError,
                });
                return;
            }

            mutate(formData, { onSuccess: handleSuccess, onError: handleError });
        } catch (err) {
            stopTrickle();
            setShowSubmitModal(false);
            const msg = getErrorMessage(err, undefined, PRODUCT_FIELD_LABELS);
            setServerErrors([msg]);
            addToast(msg, "error");
        }
    };

    // ---------- Success screen ----------
    if (step === "success") {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 text-white"
                style={{
                    background:
                        "radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)",
                }}
            >
                <div className="flex w-full max-w-xs flex-col items-center text-center">
                    <SuccessBurst />

                    <h1 className="mt-2 text-xl font-black text-white">Your product is ready! 🎉</h1>
                    <p className="pt-2 text-sm text-white/80 break-words max-w-full">
                        {title
                            ? `“${title}” has been ${isEditMode ? "updated" : "created"}.`
                            : `Your product has been ${isEditMode ? "updated" : "created"}.`} You will be
                        notified when its approved.
                    </p>

                    <button
                        onClick={() => navigate(DASHBOARD_PATH)}
                        className="mt-6 w-2/3 cursor-pointer rounded-md bg-white px-4 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.01]"
                    >
                        {isEditMode ? "Back to Products" : "Back to Dashboard"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full min-h-screen relative"
            style={{
                background:
                    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
            }}
        >
            <SubmitProgressModal open={showSubmitModal} progress={submitProgress} stage={submitStage} />
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
                            onClick={() => {
                                if (!isCompressing) thumbnailInputRef.current?.click();
                            }}
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

                            {thumbnailProgress !== null && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-8 backdrop-blur-sm">
                                    <span className="text-2xl font-black tabular-nums text-[#a6ff00]">
                                        {thumbnailProgress}%
                                    </span>
                                    <ProgressBar value={thumbnailProgress} />
                                    <p className="text-xs text-white/60">Compressing image…</p>
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={isCompressing}
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
                        {thumbnailInfo && !isCompressing && (
                            <p className="mt-2 text-center text-[11px] text-white/35">Compressed: {thumbnailInfo}</p>
                        )}
                        {thumbnail && (
                            <button
                                onClick={() => {
                                    setThumbnail(null);
                                    setThumbnailFile(null);
                                    setThumbnailInfo(null);
                                    setThumbnailError(null);
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
                            <SectionLabel>Price (NGN)</SectionLabel>
                            <IconInputRow
                                icon={<FiTag size={17} />}
                                value={price ? formatPriceInput(price) : ""}
                                onChange={(v) => {
                                    const raw = v.replace(/[^\d.]/g, "");
                                    const normalized = raw.replace(/\.(?=.*\.)/g, "");
                                    setPrice(normalized);
                                }}
                                placeholder="e.g. 25000 or 0 for free"
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
                            <SectionLabel hint="Use the toolbar to format your description — headings, colors, alignment, links, images and more.">
                                Description
                            </SectionLabel>
                            <div className="quill-dark-wrapper rounded-xl overflow-hidden" style={{ border: cardBorder }}>
                                <ReactQuill
                                    theme="snow"
                                    value={description}
                                    onChange={setDescription}
                                    modules={quillModules}
                                    placeholder="What will mentees get from this?"
                                />
                            </div>
                        </div>

                        {isCourse && (
                            <CourseContentEditor modules={courseModules} onChange={setCourseModules} />
                        )}

                        <ErrorList errors={visibleErrors} />

                        <Button
                            variant="green"
                            className="w-full"
                            disabled={isPending || isCompressing}
                            onClick={handlePreview}
                        >
                            <span className="flex items-center justify-center gap-2">
                                <FiEye size={15} />
                                {isCompressing ? "Compressing image…" : "Preview Product"}
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
                    courseModules={isCourse ? courseModules : []}
                    isSubmitting={isPending}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleCreate}
                />
            )}

            <style>{`
        /* Dark-theme skin for the Quill editor */
        .quill-dark-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          flex-wrap: wrap;
        }
        .quill-dark-wrapper .ql-container.ql-snow {
          border: none;
          background: rgba(255,255,255,0.02);
          font-family: inherit;
        }
        .quill-dark-wrapper .ql-editor {
          color: #fff;
          min-height: 160px;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .quill-dark-wrapper--compact .ql-editor {
          min-height: 100px;
        }
        .quill-dark-wrapper .ql-editor.ql-blank::before {
          color: rgba(255,255,255,0.3);
          font-style: normal;
        }
        .quill-dark-wrapper .ql-editor pre.ql-syntax {
          background: rgba(0,0,0,0.4);
          color: #d4ffb0;
          border-radius: 8px;
          padding: 0.75em;
        }
        .quill-dark-wrapper .ql-editor blockquote {
          border-left: 3px solid rgba(166,255,0,0.4);
          padding-left: 0.75em;
          color: rgba(255,255,255,0.6);
        }
        .quill-dark-wrapper .ql-snow .ql-stroke {
          stroke: rgba(255,255,255,0.55);
        }
        .quill-dark-wrapper .ql-snow .ql-fill {
          fill: rgba(255,255,255,0.55);
        }
        .quill-dark-wrapper .ql-snow .ql-picker {
          color: rgba(255,255,255,0.55);
        }
        .quill-dark-wrapper .ql-snow .ql-picker-options {
          background: #171717;
          border-color: rgba(255,255,255,0.1);
        }
        .quill-dark-wrapper .ql-snow .ql-picker.ql-expanded .ql-picker-label {
          border-color: rgba(255,255,255,0.15);
          color: #fff;
        }
        .quill-dark-wrapper .ql-snow.ql-toolbar button:hover .ql-stroke,
        .quill-dark-wrapper .ql-snow .ql-toolbar button:hover .ql-stroke {
          stroke: #a6ff00;
        }
        .quill-dark-wrapper .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .quill-dark-wrapper .ql-snow .ql-toolbar button.ql-active .ql-stroke {
          stroke: #a6ff00;
        }
        .quill-dark-wrapper .ql-snow .ql-tooltip {
          background: #171717;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .quill-dark-wrapper .ql-snow .ql-tooltip input[type="text"] {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
        }
        .quill-dark-wrapper .ql-snow .ql-tooltip a.ql-action::after,
        .quill-dark-wrapper .ql-snow .ql-tooltip a.ql-remove::before {
          color: #a6ff00;
        }

        /* Rendering of the saved rich-text HTML (preview modal / product page) */
        .rich-text-content p { margin: 0 0 0.75em; }
        .rich-text-content p:last-child { margin-bottom: 0; }
        .rich-text-content strong { color: rgba(255,255,255,0.85); }
        .rich-text-content a { color: #a6ff00; text-decoration: underline; }
        .rich-text-content ul, .rich-text-content ol { margin: 0 0 0.75em; padding-left: 1.25em; }
        .rich-text-content li { margin-bottom: 0.25em; }
        .rich-text-content img { max-width: 100%; border-radius: 8px; margin: 0.5em 0; }
        .rich-text-content blockquote {
          border-left: 3px solid rgba(166,255,0,0.4);
          padding-left: 0.75em;
          margin: 0 0 0.75em;
          color: rgba(255,255,255,0.5);
        }
        .rich-text-content pre {
          background: rgba(0,0,0,0.4);
          color: #d4ffb0;
          border-radius: 8px;
          padding: 0.75em;
          overflow-x: auto;
          margin: 0 0 0.75em;
        }
        .rich-text-content h1, .rich-text-content h2, .rich-text-content h3, .rich-text-content h4 {
          color: #fff;
          font-weight: 700;
          margin: 0.5em 0 0.4em;
        }

        input::placeholder {
          transition: color 0.3s ease;
        }

        input:focus::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
        </div>
    );
};

export default MentorProductCreate;