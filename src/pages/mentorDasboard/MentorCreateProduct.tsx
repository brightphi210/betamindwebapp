import React, { useRef, useState } from "react";
import {
    FiBookOpen,
    FiCamera,
    FiDollarSign,
    FiEye,
    FiFilm,
    FiImage,
    FiLink,
    FiLoader,
    FiPlayCircle,
    FiPlus,
    FiTag,
    FiTrash2,
    FiType,
    FiX
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import { cardBg, cardBorder } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useCreateDigitalProduct } from "../../hooks/mutations/allMutation";
import { useGlobalContext } from "../../providers/GlobalContext";
import type { ProductType } from "../userDashboard/MentorProductSuccess";
import MentorProductSuccess from "../userDashboard/MentorProductSuccess";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// ---------- Types ----------

type Step = "form" | "success";

type Module = {
    id: string;
    title: string;
    description: string; // plain text
};

const MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SECONDS = 120; // 2 minutes

const makeModule = (): Module => ({
    id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    description: "",
});

const isTextEmpty = (text: string) => !text || text.trim().length === 0;

const formatPrice = (price: string) => {
    const numeric = parseFloat(price);
    if (!numeric || numeric <= 0) return "Free";
    const trimmed = numeric % 1 === 0 ? numeric.toString() : numeric.toFixed(2);
    return `$${trimmed}`;
};

// ---------- Small building blocks (matched to EventCreate) ----------

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

// Plain textarea, replacing the old Quill rich-text field.
const TextAreaField: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    rows?: number;
}> = ({ value, onChange, placeholder, rows = 5 }) => (
    <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none resize-none"
        style={{ background: cardBg, border: cardBorder }}
    />
);

// Read-only render of plain text (description, module descriptions, book
// overview), used inside the preview modal. Preserves line breaks the
// mentor typed since it's no longer HTML.
const TextDisplay: React.FC<{ text: string }> = ({ text }) => (
    <p className="whitespace-pre-wrap text-sm text-white/60 leading-relaxed">{text}</p>
);

// ---------- Module row (Course content) ----------

const ModuleRow: React.FC<{
    index: number;
    module: Module;
    onChange: (patch: Partial<Module>) => void;
    onRemove: () => void;
    canRemove: boolean;
}> = ({ index, module, onChange, onRemove, canRemove }) => (
    <div className="rounded-xl p-4" style={{ background: cardBg, border: cardBorder }}>
        <div className="mb-3 flex items-center justify-between gap-3">
            <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                style={{ background: "#a6ff00" }}
            >
                {index + 1}
            </span>
            <input
                value={module.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder={`Module ${index + 1} title`}
                className="flex-1 rounded-lg px-3 py-2 bg-transparent outline-none text-white text-sm placeholder-white/30"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            {canRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 hover:text-red-400"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                >
                    <FiTrash2 size={14} />
                </button>
            )}
        </div>
        <TextAreaField
            value={module.description}
            onChange={(v) => onChange({ description: v })}
            placeholder="What will mentees learn in this module?"
        />
    </div>
);

// ---------- Preview modal (styled after Events.tsx's GuestsModal) ----------

const ProductPreviewModal: React.FC<{
    type: ProductType;
    title: string;
    price: string;
    link: string;
    description: string;
    thumbnail: string | null;
    video: string | null;
    modules: Module[];
    overview: string;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ type, title, price, link, description, thumbnail, video, modules, overview, isSubmitting, onClose, onConfirm }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
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
            {/* Header */}
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

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6">
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                    style={{ background: "rgba(166,255,0,0.12)", color: "#a6ff00" }}
                >
                    {type === "Course" ? <FiPlayCircle size={12} /> : <FiBookOpen size={12} />}
                    {type}
                </span>

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

                {video && <video src={video} controls className="w-full aspect-video rounded-xl mb-5 bg-black object-cover" />}

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
                    <TextDisplay text={description} />
                </div>

                {type === "Course" ? (
                    <div className="mb-2">
                        <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wide">
                            Course Content · {modules.length} module{modules.length === 1 ? "" : "s"}
                        </h3>
                        <div className="flex flex-col gap-3">
                            {modules.map((m, i) => (
                                <div key={m.id} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: cardBorder }}>
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <span
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black"
                                            style={{ background: "#a6ff00" }}
                                        >
                                            {i + 1}
                                        </span>
                                        <p className="text-white text-sm font-semibold truncate">{m.title || `Module ${i + 1}`}</p>
                                    </div>
                                    <TextDisplay text={m.description} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-2">
                        <h3 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Overview</h3>
                        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: cardBorder }}>
                            <TextDisplay text={overview} />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 p-6 pt-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
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
                        {isSubmitting ? "Creating..." : `Create ${type}`}
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
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [type, setType] = useState<ProductType>("Course");
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [link, setLink] = useState("");
    const [description, setDescription] = useState("");

    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    const [video, setVideo] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [checkingVideo, setCheckingVideo] = useState(false);

    const [modules, setModules] = useState<Module[]>([makeModule()]);
    const [overview, setOverview] = useState("");

    const [showPreview, setShowPreview] = useState(false);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnail(URL.createObjectURL(file));
            setThumbnailFile(file);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoError(null);

        if (file.size > MAX_VIDEO_BYTES) {
            setVideoError(`Video is ${(file.size / (1024 * 1024)).toFixed(1)}MB — must be under 10MB.`);
            if (videoInputRef.current) videoInputRef.current.value = "";
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setCheckingVideo(true);

        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.onloadedmetadata = () => {
            setCheckingVideo(false);
            if (probe.duration > MAX_VIDEO_SECONDS) {
                setVideoError(`Video is ${Math.ceil(probe.duration / 60)} min long — must be 2 minutes or less.`);
                URL.revokeObjectURL(objectUrl);
                if (videoInputRef.current) videoInputRef.current.value = "";
                return;
            }
            setVideo(objectUrl);
            setVideoFile(file);
        };
        probe.onerror = () => {
            setCheckingVideo(false);
            setVideoError("Couldn't read this video file. Please try a different file.");
            URL.revokeObjectURL(objectUrl);
            if (videoInputRef.current) videoInputRef.current.value = "";
        };
        probe.src = objectUrl;
    };

    const removeVideo = () => {
        if (video) URL.revokeObjectURL(video);
        setVideo(null);
        setVideoFile(null);
        setVideoError(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    const addModule = () => setModules((prev) => [...prev, makeModule()]);
    const removeModule = (id: string) => setModules((prev) => prev.filter((m) => m.id !== id));
    const patchModule = (id: string, patch: Partial<Module>) =>
        setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

    const contentValid =
        type === "Course"
            ? modules.length > 0 && modules.every((m) => m.title.trim() && !isTextEmpty(m.description))
            : !isTextEmpty(overview);

    const isValid = !!(
        title.trim() &&
        price &&
        Number(price) > 0 &&
        link.trim() &&
        !isTextEmpty(description) &&
        contentValid
    );

    // Maps our form state onto the digital-product API shape:
    // { product_type, link, course_content?, title, description, price, summary?, is_published, cover_image, video }
    const handleCreate = () => {
        if (!isValid) return;

        const formData = new FormData();
        formData.append("product_type", type === "Course" ? "course" : "book");
        formData.append("title", title);
        formData.append("link", link);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("is_published", "false");

        if (type === "Course") {
            formData.append(
                "course_content",
                JSON.stringify(modules.map(({ title: t, description: d }) => ({ title: t, description: d })))
            );
        } else {
            formData.append("summary", overview);
        }

        if (thumbnailFile) formData.append("cover_image", thumbnailFile);
        if (videoFile) formData.append("video", videoFile);

        mutate(formData, {
            onSuccess: () => {
                setShowPreview(false);
                setStep("success");
            },
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    "Could not create product. Please try again.";
                addToast(message, "error");
            },
        });
    };

    // ─── Success screen ─────────────────────────────────────────────────
    if (step === "success") {
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
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-8">
                    <h2 className="mb-1 text-xl font-bold text-white sm:text-2xl">Create Product</h2>
                    <p className="text-sm text-white/40">List a course or book for mentees to purchase.</p>
                </div>

                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* Left: media uploads */}
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
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ background: cardBg }}>
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
                            <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
                        </div>
                        {thumbnail && (
                            <button
                                onClick={() => {
                                    setThumbnail(null);
                                    setThumbnailFile(null);
                                }}
                                className="mt-2 w-full text-xs text-white/40 transition-colors hover:text-white/70"
                            >
                                Remove image
                            </button>
                        )}

                        <div className="mt-6">
                            <SectionLabel hint="Max 2 minutes, under 10MB.">Preview Video</SectionLabel>
                            {video ? (
                                <div className="overflow-hidden rounded-2xl" style={{ border: cardBorder }}>
                                    <video src={video} controls className="aspect-video w-full bg-black object-cover" />
                                    <div className="flex items-center justify-between px-3 py-2.5" style={{ background: cardBg, borderTop: cardBorder }}>
                                        <span className="truncate text-xs text-white/50">{videoFile?.name}</span>
                                        <button onClick={removeVideo} className="ml-2 shrink-0 text-white/40 hover:text-red-400">
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()}
                                    disabled={checkingVideo}
                                    className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl"
                                    style={{ background: cardBg, border: `1px dashed rgba(255,255,255,0.15)` }}
                                >
                                    {checkingVideo ? (
                                        <FiLoader size={22} className="animate-spin text-white/30" />
                                    ) : (
                                        <FiFilm size={22} className="text-white/20" />
                                    )}
                                    <p className="text-xs text-white/30">{checkingVideo ? "Checking video..." : "Upload preview video"}</p>
                                </button>
                            )}
                            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                            {videoError && <p className="mt-2 text-xs text-red-400">{videoError}</p>}
                        </div>
                    </div>

                    {/* Right: form */}
                    <div className="min-w-0 flex-1 space-y-5">
                        <div>
                            <SectionLabel>Type</SectionLabel>
                            <div className="flex gap-2">
                                {(["Course", "Book"] as ProductType[]).map((t) => {
                                    const active = type === t;
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setType(t)}
                                            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-[#a6ff00] text-black" : "text-white/60 hover:text-white"
                                                }`}
                                            style={active ? undefined : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                        >
                                            {t === "Course" ? <FiPlayCircle size={14} /> : <FiBookOpen size={14} />}
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Title</SectionLabel>
                            <IconInputRow icon={<FiType size={17} />} value={title} onChange={setTitle} placeholder="e.g. System Design From Scratch" />
                        </div>

                        <div>
                            <SectionLabel>Price (USD)</SectionLabel>
                            <IconInputRow
                                icon={<FiDollarSign size={17} />}
                                value={price}
                                onChange={(v) => setPrice(v.replace(/[^0-9.]/g, ""))}
                                placeholder="e.g. 49"
                                inputMode="numeric"
                            />
                        </div>

                        <div>
                            <SectionLabel>{type === "Course" ? "Course Link" : "Book Link"}</SectionLabel>
                            <IconInputRow
                                icon={<FiLink size={17} />}
                                value={link}
                                onChange={setLink}
                                placeholder={
                                    type === "Course" ? "https://yourplatform.com/course-name" : "https://yourstore.com/book-name"
                                }
                                subtext={`Where mentees go to ${type === "Course" ? "take the course" : "get the book"} after purchase.`}
                            />
                        </div>

                        <div>
                            <SectionLabel>Description</SectionLabel>
                            <TextAreaField value={description} onChange={setDescription} placeholder="What will mentees get from this?" />
                        </div>

                        {type === "Course" ? (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <SectionLabel hint="Break the course into modules mentees will move through.">Course Content</SectionLabel>
                                </div>
                                <div className="space-y-3">
                                    {modules.map((m, i) => (
                                        <ModuleRow
                                            key={m.id}
                                            index={i}
                                            module={m}
                                            onChange={(patch) => patchModule(m.id, patch)}
                                            onRemove={() => removeModule(m.id)}
                                            canRemove={modules.length > 1}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={addModule}
                                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#a6ff00] hover:underline"
                                >
                                    <FiPlus size={13} />
                                    Add Module
                                </button>
                            </div>
                        ) : (
                            <div>
                                <SectionLabel hint="Give mentees a sense of what the book covers.">Overview / Summary</SectionLabel>
                                <TextAreaField value={overview} onChange={setOverview} placeholder="Summarize what the book is about..." />
                            </div>
                        )}

                        <Button variant="green" className="w-full" disabled={!isValid || isPending} onClick={() => setShowPreview(true)}>
                            <span className="flex items-center justify-center gap-2">
                                <FiEye size={15} />
                                Preview {type}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            {showPreview && (
                <ProductPreviewModal
                    type={type}
                    title={title}
                    price={price}
                    link={link}
                    description={description}
                    thumbnail={thumbnail}
                    video={video}
                    modules={modules}
                    overview={overview}
                    isSubmitting={isPending}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleCreate}
                />
            )}
        </div>
    );
};

export default MentorProductCreate;