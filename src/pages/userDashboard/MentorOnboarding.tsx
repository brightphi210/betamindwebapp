import { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiImage, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import Button from "../../component/ui/Button";
import { useCreateMentor } from "../../hooks/mutations/allMutation";
import { useGlobalContext } from "../../providers/GlobalContext";

// Hardcoded category options for the button picker — same list used in
// MentorProfile.tsx so the onboarding and edit flows stay in sync. Edit
// this list to match what you actually want mentors to choose from.
const CATEGORY_OPTIONS = [
    "tech",
    "finance",
    "business",
    "design",
    "product",
    "marketing",
    "leadership",
    "education",
    "politics",
    "media",
    "health",
    "lifestyle",
    "sports",
    "entertainment",
    "science",
];

// Fixed expertise/skill options — same pattern as categories, kept in sync
// with MentorProfile.tsx since there's no expertise endpoint.
const EXPERTISE_OPTIONS = [
    "career coaching",
    "resume review",
    "interview prep",
    "public speaking",
    "leadership coaching",
    "technical mentoring",
    "startup advice",
    "product strategy",
    "ux design",
    "data analysis",
    "marketing strategy",
    "financial planning",
    "personal branding",
    "networking",
    "time management",
    "fundraising",
];

// Major world languages for the language dropdown — matches MentorProfile.tsx.
const LANGUAGE_OPTIONS = [
    "English",
    "Spanish",
    "French",
    "Portuguese",
    "German",
    "Italian",
    "Mandarin Chinese",
    "Arabic",
    "Hindi",
    "Russian",
    "Japanese",
    "Korean",
    "Swahili",
    "Yoruba",
    "Igbo",
    "Hausa",
    "Dutch",
    "Turkish",
    "Vietnamese",
    "Indonesian",
];

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const prefixBg = "rgba(255,255,255,0.03)";

const fieldClass =
    "w-full rounded-md px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";

/* ─── Availability (same pattern as TutorProfile.tsx) ─────────────────── */
interface TimeSlot {
    id: number;
    startTime: string; // 24hr "HH:MM"
    endTime: string;
}

interface DayAvailability {
    day: string;
    enabled: boolean;
    slots: TimeSlot[];
}

const DAYS_OF_WEEK = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

const MAX_SLOTS_PER_DAY = 3;

const defaultAvailability: DayAvailability[] = DAYS_OF_WEEK.map((d) => ({
    day: d.key,
    enabled: false,
    slots: [],
}));

const emptyTimeSlot = (id: number): TimeSlot => ({ id, startTime: "09:00", endTime: "10:00" });

// Backend expects an array of concrete { day_of_week, start_time, end_time }
// slots — same shape TutorProfile.tsx already sends for tutors.
const buildAvailabilityPayload = (availability: DayAvailability[]) =>
    availability
        .filter((d) => d.enabled)
        .flatMap((d) =>
            d.slots.map((s) => ({
                day_of_week: d.day.charAt(0).toUpperCase() + d.day.slice(1),
                start_time: `${s.startTime}:00`,
                end_time: `${s.endTime}:00`,
            }))
        );

const to12Hour = (time24: string): { hour: number; minute: number; period: "AM" | "PM" } => {
    if (!time24) return { hour: 9, minute: 0, period: "AM" };
    const [hStr, mStr] = time24.split(":");
    const hours = parseInt(hStr, 10) || 0;
    const minutes = parseInt(mStr, 10) || 0;
    const period: "AM" | "PM" = hours >= 12 ? "PM" : "AM";
    let hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;
    return { hour: hour12, minute: minutes, period };
};

const to24Hour = (hour12: number, minute: number, period: "AM" | "PM"): string => {
    let hours = hour12 % 12;
    if (period === "PM") hours += 12;
    return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5MIN = Array.from({ length: 12 }, (_, i) => i * 5);

const TimePickerInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}> = ({ value, onChange, disabled }) => {
    const { hour, minute, period } = to12Hour(value);
    const update = (h: number, m: number, p: "AM" | "PM") => onChange(to24Hour(h, m, p));
    const selectCls = "rounded-lg px-1.5 py-2 text-xs text-white outline-none transition-all disabled:opacity-60";

    return (
        <div className="flex items-center gap-1 flex-1 min-w-[170px]">
            <select
                disabled={disabled}
                value={hour}
                onChange={(e) => update(parseInt(e.target.value, 10), minute, period)}
                className={selectCls}
                style={{ background: cardBg, border: cardBorder }}
                aria-label="Hour"
            >
                {HOURS_12.map((h) => (
                    <option key={h} value={h} className="bg-[#0a0f08]">
                        {h}
                    </option>
                ))}
            </select>
            <span className="text-xs text-white/30 shrink-0">:</span>
            <select
                disabled={disabled}
                value={minute}
                onChange={(e) => update(hour, parseInt(e.target.value, 10), period)}
                className={selectCls}
                style={{ background: cardBg, border: cardBorder }}
                aria-label="Minute"
            >
                {MINUTES_5MIN.map((m) => (
                    <option key={m} value={m} className="bg-[#0a0f08]">
                        {String(m).padStart(2, "0")}
                    </option>
                ))}
            </select>
            <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: cardBorder }}>
                {(["AM", "PM"] as const).map((p) => (
                    <button
                        key={p}
                        type="button"
                        disabled={disabled}
                        onClick={() => update(hour, minute, p)}
                        className={`px-2 py-2 text-[10px] font-bold transition-all ${period === p ? "bg-[#a6ff00] text-black" : "text-white/40 hover:text-white"
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

const AvailabilitySection: React.FC<{
    availability: DayAvailability[];
    onChange: (a: DayAvailability[]) => void;
    disabled?: boolean;
}> = ({ availability, onChange, disabled }) => {
    const updateDay = (dayKey: string, updater: (d: DayAvailability) => DayAvailability) => {
        onChange(availability.map((d) => (d.day === dayKey ? updater(d) : d)));
    };

    const toggleDay = (dayKey: string) => {
        updateDay(dayKey, (d) => {
            const enabling = !d.enabled;
            return {
                ...d,
                enabled: enabling,
                slots: enabling && d.slots.length === 0 ? [emptyTimeSlot(1)] : d.slots,
            };
        });
    };

    const addSlot = (dayKey: string) => {
        updateDay(dayKey, (d) => {
            if (d.slots.length >= MAX_SLOTS_PER_DAY) return d;
            const nextId = d.slots.length ? Math.max(...d.slots.map((s) => s.id)) + 1 : 1;
            return { ...d, slots: [...d.slots, emptyTimeSlot(nextId)] };
        });
    };

    const removeSlot = (dayKey: string, slotId: number) => {
        updateDay(dayKey, (d) => ({ ...d, slots: d.slots.filter((s) => s.id !== slotId) }));
    };

    const updateSlot = (dayKey: string, slotId: number, field: "startTime" | "endTime", value: string) => {
        updateDay(dayKey, (d) => ({
            ...d,
            slots: d.slots.map((s) => (s.id === slotId ? { ...s, [field]: value } : s)),
        }));
    };

    const applyToAllDays = (dayKey: string) => {
        const source = availability.find((d) => d.day === dayKey);
        if (!source || source.slots.length === 0) return;
        onChange(
            availability.map((d) => ({
                ...d,
                enabled: true,
                slots: source.slots.map((s, idx) => ({ ...s, id: idx + 1 })),
            }))
        );
    };

    return (
        <div className="flex flex-col gap-2.5">
            {availability.map((dayAv) => {
                const dayMeta = DAYS_OF_WEEK.find((d) => d.key === dayAv.day)!;
                const atMax = dayAv.slots.length >= MAX_SLOTS_PER_DAY;

                return (
                    <div key={dayAv.day} className="rounded-xl p-3.5 transition-all" style={{ background: cardBg, border: cardBorder }}>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => toggleDay(dayAv.day)}
                                    className="relative w-9 h-5 rounded-full transition-all shrink-0"
                                    style={{ background: dayAv.enabled ? "#a6ff00" : "rgba(255,255,255,0.15)" }}
                                >
                                    <span
                                        className={`absolute top-0.5 w-4 h-4 rounded-full shadow transition-all ${dayAv.enabled ? "left-4 bg-black" : "left-0.5 bg-white"
                                            }`}
                                    />
                                </button>
                                <span className={`text-sm font-bold ${dayAv.enabled ? "text-white" : "text-white/40"}`}>
                                    {dayMeta.label}
                                </span>
                                {!dayAv.enabled && <span className="text-xs text-white/30 italic">Unavailable</span>}
                            </div>

                            {dayAv.enabled && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => applyToAllDays(dayAv.day)}
                                        className="text-[11px] font-semibold text-white/30 hover:text-[#a6ff00] transition-colors"
                                    >
                                        Copy to all days
                                    </button>
                                    <button
                                        type="button"
                                        disabled={disabled || atMax}
                                        onClick={() => addSlot(dayAv.day)}
                                        className="flex items-center gap-1 text-xs font-semibold text-[#a6ff00] hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <FiPlus size={12} /> Add slot
                                    </button>
                                </div>
                            )}
                        </div>

                        {dayAv.enabled && (
                            <div className="mt-3 flex flex-col gap-2">
                                {dayAv.slots.map((slot) => (
                                    <div key={slot.id} className="flex flex-wrap items-center gap-2">
                                        <TimePickerInput
                                            value={slot.startTime}
                                            disabled={disabled}
                                            onChange={(v) => updateSlot(dayAv.day, slot.id, "startTime", v)}
                                        />
                                        <span className="text-xs text-white/30 shrink-0">to</span>
                                        <TimePickerInput
                                            value={slot.endTime}
                                            disabled={disabled}
                                            onChange={(v) => updateSlot(dayAv.day, slot.id, "endTime", v)}
                                        />
                                        <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => removeSlot(dayAv.day, slot.id)}
                                            className="p-1.5 text-white/20 hover:text-red-400 transition-colors shrink-0"
                                        >
                                            <FiTrash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                                {atMax && <p className="text-[11px] text-white/30 italic">Maximum {MAX_SLOTS_PER_DAY} slots reached for this day</p>}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

const Field: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    helper?: string;
}> = ({ label, value, onChange, placeholder, type = "text", helper }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={fieldClass}
            style={{ background: cardBg, border: cardBorder }}
        />
        {helper && <p className="mt-2 text-xs text-white/40">{helper}</p>}
    </div>
);

// Native <select> dropdown, styled to match the other inputs — used for Language.
const SelectField: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    placeholder?: string;
    helper?: string;
}> = ({ label, value, options, onChange, placeholder = "Select...", helper }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={fieldClass}
            style={{ background: cardBg, border: cardBorder }}
        >
            <option value="" disabled>
                {placeholder}
            </option>
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
        {helper && <p className="mt-2 text-xs text-white/40">{helper}</p>}
    </div>
);

const AreaField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    helper?: string;
}> = ({ label, value, onChange, placeholder, helper }) => (
    <div>
        <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`${fieldClass} resize-none`}
            style={{ background: cardBg, border: cardBorder }}
        />
        {helper && <p className="mt-2 text-xs text-white/40">{helper}</p>}
    </div>
);

const SocialField: React.FC<{
    badge: string;
    prefix: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}> = ({ badge, prefix, value, onChange, placeholder }) => (
    <div className="flex items-center gap-3">
        <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white/60"
            style={{ background: cardBg, border: cardBorder }}
        >
            {badge}
        </div>
        <div className="flex flex-1 overflow-hidden rounded-xl" style={{ border: cardBorder }}>
            <span
                className="flex shrink-0 items-center px-4 text-sm font-semibold text-white/50"
                style={{ background: prefixBg }}
            >
                {prefix}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/30 outline-none"
            />
        </div>
    </div>
);

// Multi-select pill group — used for expertise (same interaction as Category).
const MultiPillSelect: React.FC<{
    label: string;
    values: string[];
    options: string[];
    onChange: (v: string[]) => void;
}> = ({ label, values, options, onChange }) => (
    <div>
        <p className="mb-2 text-sm font-semibold text-white">{label}</p>
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = values.includes(opt);
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() =>
                            onChange(active ? values.filter((v) => v !== opt) : [...values, opt])
                        }
                        className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-all ${active
                            ? "bg-[#a6ff00] text-black"
                            : "text-white hover:border-[#a6ff00] hover:text-[#a6ff00]"
                            }`}
                        style={active ? undefined : { background: cardBg, border: cardBorder }}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    </div>
);

type Step = "professional" | "social" | "availability";

const stepOrder: Step[] = ["professional", "social", "availability"];

const MentorOnboarding = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();

    const { mutate, isPending } = useCreateMentor();

    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>("professional");

    // Preview URL (for <img> display)
    const [banner, setBanner] = useState<string | null>(null);

    // Actual File object to submit
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const [nickname, setNickname] = useState("");
    const [occupation, setOccupation] = useState("");
    const [bio, setBio] = useState("");
    const [experience, setExperience] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [language, setLanguage] = useState("");

    // Optional 2-minute pitch video — shown on the public mentor profile.
    const [videoLink, setVideoLink] = useState("");

    // Categories — button picker from a fixed list, same pattern as MentorProfile.tsx
    const [categories, setCategories] = useState<string[]>([]);
    const [expertise, setExpertise] = useState<string[]>([]);

    const [linkedin, setLinkedin] = useState("");
    const [xHandle, setXHandle] = useState("");
    const [website, setWebsite] = useState("");

    // Availability — per-day toggle + up to MAX_SLOTS_PER_DAY time slots each.
    const [availability, setAvailability] = useState<DayAvailability[]>(defaultAvailability);

    const professionalComplete = !!(nickname && occupation && bio && experience);
    const socialComplete = categories.length > 0;
    const availabilityComplete = availability.some((d) => d.enabled && d.slots.length > 0);

    const toggleCategory = (cat: string) => {
        setCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBanner(URL.createObjectURL(file));
            setBannerFile(file);
        }
    };

    const goNext = () => {
        const idx = stepOrder.indexOf(step);
        if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
    };

    const goBack = () => {
        const idx = stepOrder.indexOf(step);
        if (idx > 0) setStep(stepOrder[idx - 1]);
        else navigate("/dashboard/overview");
    };

    const handleFinish = () => {
        if (!availabilityComplete) return;

        const formData = new FormData();
        formData.append("occupation", occupation);
        formData.append("bio", bio);
        formData.append("nick_name", nickname);
        formData.append("years_of_experience", String(parseInt(experience, 10) || 0));
        formData.append("hourly_rate", hourlyRate ? String(parseFloat(hourlyRate)) : "");
        formData.append("language", language);
        // Link to the mentor's ~2-minute expertise walkthrough (YouTube/Loom/Vimeo).
        formData.append("intro_video_url", videoLink);

        if (bannerFile) formData.append("cover_images", bannerFile);

        // Categories/Expertise as JSON-stringified arrays — the backend expects a
        // single field it can json.loads() itself, not repeated plain-string fields.
        formData.append("categories", JSON.stringify(categories));
        formData.append("expertise", JSON.stringify(expertise));

        // Backend expects the singular key "social_link" as a flat object:
        // { twitter, linkedin, website } — NOT "social_links" as an array of
        // {platform, url} dicts, and NOT bracket notation.
        const socialLink = {
            linkedin: linkedin ? `https://linkedin.com/in/${linkedin}` : "",
            twitter: xHandle ? `https://x.com/${xHandle}` : "",
            website: website || "",
        };
        formData.append("social_link", JSON.stringify(socialLink));

        // Availability now sent as concrete day/time slots — same shape
        // TutorProfile.tsx sends for tutors — instead of a coarse
        // "weekdays/weekends" + hours-per-day pair.
        formData.append("availability", JSON.stringify(buildAvailabilityPayload(availability)));

        mutate(formData, {
            onSuccess: () => {
                navigate("/dashboard/mentor/success", {
                    state: { productName: categories[0] ?? "Mentorship" },
                });
            },
            onError: (error: any) => {
                console.error("Error creating mentor profile:", error);
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    "Something went wrong. Please try again.";

                addToast(message, "error");
            },
        });
    };

    const stepLabels: Record<Step, string> = {
        professional: "Professional Info",
        social: "Category & Socials",
        availability: "Availability",
    };

    return (
        <div
            className="min-h-screen w-full text-white"
            style={{
                background:
                    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
            }}
        >
            <LoadingOverlay visible={isPending} />
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                {/* Back to dashboard */}
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/overview")}
                    className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                {/* Page header */}
                <div className="mb-5">
                    <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Become a mentor</h1>
                    <p className="mt-3 max-w-2xl text-sm text-white/40 sm:text-base">
                        Share your professional background first, then set up your availability.
                    </p>
                </div>

                {/* Step tabs */}
                <div className="mb-5 flex items-center gap-2 flex-wrap">
                    {stepOrder.map((s) => (
                        <span
                            key={s}
                            className={`text-xs font-semibold transition-colors p-2.5 px-5 rounded-full 
                                ${step === s ? " bg-white text-black" : "bg-white/10 text-white/25"
                                }`}
                        >
                            {stepLabels[s]}
                        </span>
                    ))}
                </div>

                {step === "professional" && (
                    <div>
                        <div className="space-y-5">
                            <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Personal Info</h2>
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Cover Photo</p>
                                <div className="relative mb-6 sm:mb-6">
                                    <div
                                        className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl sm:h-44"
                                        style={{ background: cardBg, border: cardBorder }}
                                    >
                                        {banner ? (
                                            <img src={banner} alt="Cover" className="h-full w-full object-cover" />
                                        ) : (
                                            <FiImage size={28} className="text-white/20" />
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                                        style={{ background: "rgba(0,0,0,0.6)" }}
                                    >
                                        <FiCamera size={13} />
                                        {banner ? "Change Cover" : "Upload Cover"}
                                    </button>
                                    <input
                                        ref={bannerInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleBannerChange}
                                    />

                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    label="Mentor Nickname"
                                    value={nickname}
                                    onChange={setNickname}
                                    placeholder="Alex Mentor"
                                />
                                <Field
                                    label="Occupation"
                                    value={occupation}
                                    onChange={setOccupation}
                                    placeholder="Product Designer"
                                />
                            </div>

                            <AreaField
                                label="Bio"
                                value={bio}
                                onChange={setBio}
                                placeholder="Tell people who you are and what you help with"
                                helper="This appears on your public mentor profile."
                            />

                            <Field
                                label="Intro Video Link"
                                value={videoLink}
                                onChange={setVideoLink}
                                placeholder="https://youtube.com/watch?v=..."
                                helper="Optional — share a 2-minute video walking mentees through your expertise. YouTube, Loom, or Vimeo links work best."
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Field
                                    label="Years of Experience"
                                    value={experience}
                                    onChange={(v) => setExperience(v.replace(/[^0-9]/g, ""))}
                                    placeholder="e.g. 4"
                                    helper="Enter a whole number of years."
                                />
                                <Field
                                    label="Hourly Rate"
                                    value={hourlyRate}
                                    onChange={(v) => setHourlyRate(v.replace(/[^0-9.]/g, ""))}
                                    placeholder="e.g. 50"
                                    helper="In NGN."
                                />
                                <SelectField
                                    label="Language"
                                    value={language}
                                    options={LANGUAGE_OPTIONS}
                                    onChange={setLanguage}
                                    placeholder="Select a language"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {step === "social" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Category &amp; Social Links</h2>
                        <div className="space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Category</p>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORY_OPTIONS.map((cat) => {
                                        const active = categories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-all ${active
                                                    ? "bg-[#a6ff00] text-black"
                                                    : "text-white hover:border-[#a6ff00] hover:text-[#a6ff00]"
                                                    }`}
                                                style={active ? undefined : { background: cardBg, border: cardBorder }}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <MultiPillSelect
                                label="Expertise"
                                values={expertise}
                                options={EXPERTISE_OPTIONS}
                                onChange={setExpertise}
                            />

                            <div>
                                <p className="mb-3 text-sm font-semibold text-white">Social Links</p>
                                <div className="space-y-3">
                                    <SocialField
                                        badge="in"
                                        prefix="linkedin.com/in/"
                                        value={linkedin}
                                        onChange={setLinkedin}
                                        placeholder="yourname"
                                    />
                                    <SocialField
                                        badge="X"
                                        prefix="x.com/@"
                                        value={xHandle}
                                        onChange={setXHandle}
                                        placeholder="yourhandle"
                                    />
                                    <Field
                                        label="Website"
                                        value={website}
                                        onChange={setWebsite}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === "availability" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Availability</h2>
                        <p className="mb-6 -mt-3 text-sm text-white/40">
                            Turn on the days you're available and add up to {MAX_SLOTS_PER_DAY} time slots per day so mentees know when to book you.
                        </p>
                        <AvailabilitySection
                            availability={availability}
                            onChange={setAvailability}
                            disabled={isPending}
                        />
                    </div>
                )}

                <div className="mt-10 flex  gap-3 sm:flex-row justify-between">
                    <Button variant="white" onClick={goBack}>
                        <span className="flex items-center justify-center gap-2">
                            {step !== "professional" && <FiArrowLeft size={15} />}
                            {step === "professional" ? "Cancel" : "Previous"}
                        </span>
                    </Button>
                    {step !== "availability" ? (
                        <Button
                            variant="green"
                            onClick={goNext}
                            disabled={step === "professional" ? !professionalComplete : !socialComplete}
                        >
                            <span className="flex items-center justify-center gap-2">
                                Next
                                <FiArrowRight size={15} />
                            </span>
                        </Button>
                    ) : (
                        <Button variant="green" onClick={handleFinish} disabled={!availabilityComplete || isPending}>
                            <span className="flex items-center justify-center gap-2">
                                <FiCheck size={15} />
                                Finish
                            </span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorOnboarding;