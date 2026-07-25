import React, { useRef, useState } from "react";
import {
    FiBookOpen,
    FiCamera,
    FiCheck,
    FiFilm,
    FiImage,
    FiLink,
    FiLoader,
    FiPlayCircle,
    FiPlus,
    FiTrash2,
} from "react-icons/fi";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useOutletContext } from "react-router-dom";
import { cardBg, cardBorder, fieldClass } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGlobalContext } from "../../providers/GlobalContext";
import { type MentorDashboardContext } from "./MentorDashboardLayout";

// ---------- Types ----------

type ProductType = "Course" | "Book";

type Module = {
    id: string;
    title: string;
    description: string; // Quill HTML
};

const MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SECONDS = 120; // 2 minutes

const makeModule = (): Module => ({
    id: `mod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    description: "",
});

// Quill produces "<p><br></p>" for an empty editor — treat that as blank.
const isQuillEmpty = (html: string) => !html || html.replace(/<(.|\n)*?>/g, "").trim().length === 0;

const QUILL_MODULES = {
    toolbar: [["bold", "italic", "underline"], [{ list: "ordered" }, { list: "bullet" }], ["link"], ["clean"]],
};

// ---------- Small building blocks (matched to MentorProducts / EventCreate) ----------

const SectionLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
    <div className="mb-2">
        <p className="text-sm font-semibold text-white">{children}</p>
        {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
    </div>
);

const QuillField: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({
    value,
    onChange,
    placeholder,
}) => (
    <div className="quill-dark rounded-xl overflow-hidden" style={{ background: cardBg, border: cardBorder }}>
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            modules={QUILL_MODULES}
            placeholder={placeholder}
        />
        <style>{`
            .quill-dark .ql-toolbar {
                border: none;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                background: rgba(255,255,255,0.02);
            }
            .quill-dark .ql-container {
                border: none;
                font-family: inherit;
                font-size: 0.875rem;
                min-height: 120px;
            }
            .quill-dark .ql-editor {
                color: #fff;
                min-height: 120px;
            }
            .quill-dark .ql-editor.ql-blank::before {
                color: rgba(255,255,255,0.3);
                font-style: normal;
            }
            .quill-dark .ql-stroke { stroke: rgba(255,255,255,0.5); }
            .quill-dark .ql-fill { fill: rgba(255,255,255,0.5); }
            .quill-dark .ql-picker { color: rgba(255,255,255,0.5); }
            .quill-dark button:hover .ql-stroke,
            .quill-dark button.ql-active .ql-stroke { stroke: #a6ff00; }
            .quill-dark button:hover .ql-fill,
            .quill-dark button.ql-active .ql-fill { fill: #a6ff00; }
            .quill-dark .ql-picker-options {
                background: #0a0d09;
                border: 1px solid rgba(255,255,255,0.1);
            }
        `}</style>
    </div>
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
                className={`${fieldClass} flex-1`}
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
        <QuillField
            value={module.description}
            onChange={(v) => onChange({ description: v })}
            placeholder="What will mentees learn in this module?"
        />
    </div>
);

// ---------- Page ----------

const MentorProductCreate: React.FC = () => {
    useOutletContext<MentorDashboardContext>();
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();

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

    const [isSubmitting, setIsSubmitting] = useState(false);

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
                setVideoError(
                    `Video is ${Math.ceil(probe.duration / 60)} min long — must be 2 minutes or less.`
                );
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
            ? modules.length > 0 && modules.every((m) => m.title.trim() && !isQuillEmpty(m.description))
            : !isQuillEmpty(overview);

    const isValid = !!(
        title.trim() &&
        price &&
        Number(price) > 0 &&
        link.trim() &&
        !isQuillEmpty(description) &&
        contentValid
    );

    const handleCreate = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("type", type);
            formData.append("title", title);
            formData.append("price", price);
            formData.append("link", link);
            formData.append("description", description);

            if (type === "Course") {
                formData.append(
                    "modules",
                    JSON.stringify(modules.map(({ title: t, description: d }) => ({ title: t, description: d })))
                );
            } else {
                formData.append("overview", overview);
            }

            if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
            if (videoFile) formData.append("preview_video", videoFile);

            // TODO: wire up to the real create-product endpoint once it exists.
            await new Promise((resolve) => setTimeout(resolve, 900));

            addToast("Product created", "success");
            navigate("../products");
        } catch (error: any) {
            addToast(error?.response?.data?.message || "Could not create product. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                    <div
                                        className="flex items-center justify-between px-3 py-2.5"
                                        style={{ background: cardBg, borderTop: cardBorder }}
                                    >
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
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoChange}
                            />
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
                            <label className="mb-2 block text-sm font-semibold text-white">Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
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
                                value={price}
                                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                                placeholder="e.g. 49"
                                className={fieldClass}
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-white">
                                {type === "Course" ? "Course Link" : "Book Link"}
                            </label>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/40"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                >
                                    <FiLink size={15} />
                                </div>
                                <input
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder={
                                        type === "Course"
                                            ? "https://yourplatform.com/course-name"
                                            : "https://yourstore.com/book-name"
                                    }
                                    className={`${fieldClass} flex-1`}
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-white/40">
                                Where mentees go to {type === "Course" ? "take the course" : "get the book"} after
                                purchase — e.g. a Teachable/Udemy link, or an Amazon/Gumroad page.
                            </p>
                        </div>

                        <div>
                            <SectionLabel>Description</SectionLabel>
                            <QuillField
                                value={description}
                                onChange={setDescription}
                                placeholder="What will mentees get from this?"
                            />
                        </div>

                        {type === "Course" ? (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <SectionLabel hint="Break the course into modules mentees will move through.">
                                        Course Content
                                    </SectionLabel>
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
                                <SectionLabel hint="Give mentees a sense of what the book covers.">
                                    Overview / Summary
                                </SectionLabel>
                                <QuillField
                                    value={overview}
                                    onChange={setOverview}
                                    placeholder="Summarize what the book is about..."
                                />
                            </div>
                        )}

                        <Button
                            variant="green"
                            className="w-full"
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
            </div>
        </div>
    );
};

export default MentorProductCreate;