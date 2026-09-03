import { useEffect, useRef, useState } from "react";
import {
    FiArrowLeft,
    FiArrowRight,
    FiCamera,
    FiCheck,
    FiClock,
    FiEdit2,
    FiImage,
    FiUser,
    FiUserPlus,
    FiX
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder, fieldClass, pageBackground } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useUpdateMentorProfile } from "../../hooks/mutations/allMutation";
import { useGetMyMentorProfile, useGetMyUserProfile } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";

// Hardcoded category options for the button picker — no categories endpoint exists,
// and the backend stores these as plain strings. Edit this list to match what you
// actually want mentors to choose from.
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

// Fixed expertise/skill options for the pill picker — same pattern as
// categories, since there's no expertise endpoint either. Edit freely.
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

// Major world languages for the language dropdown.
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

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
];

// Hours-per-day dropdown — value sent to the backend is the bare number.
const DAILY_AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
    { value: "1", label: "1 hr" },
    { value: "2", label: "2 hrs" },
    { value: "3", label: "3 hrs" },
    { value: "5", label: "5 hrs" },
    { value: "8", label: "8 hrs" },
];

// Page-specific tint for the social-link input prefixes (linkedin.com/in/, x.com/@).
// Not part of the shared MentorDashboardStyles set since it's only used here.
const prefixBg = "rgba(255,255,255,0.03)";

// ---------- Shared editable field components ----------

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

// Native <select> dropdown, styled to match the other inputs — used for
// Language, where a pill picker would be too many options to scan.
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

// Single-select pill group (used for availability and daily availability hours).
const PillSelect: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => (
    <div>
        <p className="mb-2 text-sm font-semibold text-white">{label}</p>
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
                const active = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all ${active
                            ? "bg-[#a6ff00] text-black"
                            : "text-white hover:border-[#a6ff00] hover:text-[#a6ff00]"
                            }`}
                        style={active ? undefined : { background: cardBg, border: cardBorder }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

// Multi-select pill group (used for expertise — same interaction as Category).
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

// ---------- Read-only display components ----------

const ViewRow: React.FC<{ label: string; value: string; placeholder?: string }> = ({
    label,
    value,
    placeholder = "Not set",
}) => (
    <div className="rounded-xl px-4 py-3" style={{ background: cardBg, border: cardBorder }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
        <p className={`mt-1 text-sm ${value ? "text-white" : "text-white/30"}`}>{value || placeholder}</p>
    </div>
);

// Defensively guards against the API returning null instead of [] for
// unset array fields (e.g. brand-new mentor profiles).
const ViewChipsRow: React.FC<{ label: string; values: string[] | null | undefined }> = ({ label, values }) => {
    const safeValues = Array.isArray(values) ? values : [];
    return (
        <div className="rounded-xl px-4 py-3" style={{ background: cardBg, border: cardBorder }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
            {safeValues.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                    {safeValues.map((v) => (
                        <span
                            key={v}
                            className="inline-flex rounded-full bg-[#a6ff00]/10 px-3 py-1 text-xs font-semibold capitalize text-[#a6ff00]"
                        >
                            {v}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="mt-1 text-sm text-white/30">Not set</p>
            )}
        </div>
    );
};

const ViewSocialRow: React.FC<{ badge: string; label: string; url: string; handle: string }> = ({
    badge,
    label,
    url,
    handle,
}) => (
    <div className="flex items-center gap-3">
        <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white/60"
            style={{ background: cardBg, border: cardBorder }}
        >
            {badge}
        </div>
        <div className="flex-1 rounded-xl px-4 py-3" style={{ background: cardBg, border: cardBorder }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
            <p className={`mt-1 text-sm ${handle ? "text-[#a6ff00]" : "text-white/30"}`}>
                {handle ? url : "Not linked"}
            </p>
        </div>
    </div>
);


const extractHandle = (url?: string) => {
    if (!url) return "";
    const clean = url.replace(/\/$/, "");
    return clean.substring(clean.lastIndexOf("/") + 1).replace(/^@/, "");
};

type Step = "professional" | "social" | "availability" | "account";

type Draft = {
    banner: string | null;
    bannerFile: File | null;
    nickname: string;
    occupation: string;
    bio: string;
    experience: string;
    hourlyRate: string;
    language: string;
    categories: string[];
    expertise: string[];
    linkedin: string;
    xHandle: string;
    website: string;
    availability: string;
    dailyAvailability: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingOrSortCode: string;
};

const emptyDraft: Draft = {
    banner: null,
    bannerFile: null,
    nickname: "",
    occupation: "",
    bio: "",
    experience: "",
    hourlyRate: "",
    language: "",
    categories: [],
    expertise: [],
    linkedin: "",
    xHandle: "",
    website: "",
    availability: "",
    dailyAvailability: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingOrSortCode: "",
};

// NOTE: backend returns/expects the singular key "social_link" as a flat
// object: { twitter, linkedin, website } — not an array of {platform, url}.
// Bank details come back under "bank_details" (was "bank_account").
// Several fields (hourly_rate, language, availability, expertise,
// daily_availability) come back as `null` on a fresh profile rather than
// "" or [] — every read below normalizes that explicitly.
const draftFromMentorProfile = (mentorProfile: any): Draft => {
    const socialLink = mentorProfile?.social_link ?? {};
    const bank = mentorProfile?.bank_details ?? {};

    return {
        banner: mentorProfile?.cover_images ?? null,
        bannerFile: null,
        nickname: mentorProfile?.nick_name ?? "",
        occupation: mentorProfile?.occupation ?? "",
        bio: mentorProfile?.bio ?? "",
        experience: mentorProfile?.years_of_experience != null ? String(mentorProfile.years_of_experience) : "",
        hourlyRate: mentorProfile?.hourly_rate != null ? String(mentorProfile.hourly_rate) : "",
        language: mentorProfile?.language ?? "",
        categories: Array.isArray(mentorProfile?.categories) ? mentorProfile.categories : [],
        expertise: Array.isArray(mentorProfile?.expertise) ? mentorProfile.expertise : [],
        linkedin: extractHandle(socialLink.linkedin),
        xHandle: extractHandle(socialLink.twitter),
        website: socialLink.website ?? "",
        availability: mentorProfile?.availability ?? "",
        dailyAvailability: mentorProfile?.daily_availability != null ? String(mentorProfile.daily_availability) : "",
        bankName: bank.bank_name ?? "",
        accountName: bank.account_name ?? "",
        accountNumber: bank.account_number ?? "",
        routingOrSortCode: bank.routing_or_sort_code ?? "",
    };
};

// ---------- Not verified gate screen ----------

const NotVerifiedScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 pt-40 text-center sm:px-6">
            <div className="mb-6 flex h-25 w-25 items-center justify-center rounded-2xl bg-neutral-900">
                <FiClock size={50} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-black sm:text-2xl px-4">Your mentor profile isn't verified yet</h1>
            <p className="mt-3 mb-8 max-w-md text-xs px-4 text-white/40">
                Thanks for submitting your mentor application. Our team is reviewing your details and you'll be
                notified as soon as your profile is approved. Once verified, you'll get full access to your mentor
                profile and dashboard.
            </p>
            <Button variant="green" onClick={onBack}>
                <span className="flex items-center gap-2">
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </span>
            </Button>
        </div>
    </div>
);

const MentorProfile = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const { myMentorProfile, isLoading: mentorLoading } = useGetMyMentorProfile();
    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const mentorProfile = myMentorProfile?.data;
    const userProfile = myProfile?.data;
    console.log('Mentor Profile', mentorProfile)

    const { mutate: updateMentor, isPending } = useUpdateMentorProfile();

    const [step, setStep] = useState<Step>("professional");
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [isPreparingSave, setIsPreparingSave] = useState(false);

    useEffect(() => {
        if (mentorProfile) setDraft(draftFromMentorProfile(mentorProfile));
    }, [mentorProfile]);

    const startEditing = () => {
        setDraft(draftFromMentorProfile(mentorProfile));
        setStep("professional");
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setDraft(draftFromMentorProfile(mentorProfile));
        setIsEditing(false);
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setDraft((d) => ({ ...d, banner: URL.createObjectURL(file), bannerFile: file }));
    };

    const toggleCategory = (cat: string) => {
        setDraft((d) => ({
            ...d,
            categories: d.categories.includes(cat)
                ? d.categories.filter((c) => c !== cat)
                : [...d.categories, cat],
        }));
    };

    const professionalComplete = !!(draft.nickname && draft.occupation && draft.bio && draft.experience);
    const socialComplete = draft.categories.length > 0;
    const availabilityComplete = !!(draft.availability && draft.dailyAvailability);
    const accountComplete = !!(draft.bankName && draft.accountName && draft.accountNumber);

    const stepOrder: Step[] = ["professional", "social", "availability", "account"];
    const goNext = () => {
        const idx = stepOrder.indexOf(step);
        if (idx < stepOrder.length - 1) setStep(stepOrder[idx + 1]);
    };
    const goBack = () => {
        const idx = stepOrder.indexOf(step);
        if (idx > 0) setStep(stepOrder[idx - 1]);
    };
    // Used in view (non-editing) mode, where there's no tab bar to jump
    // between sections — cycles forward, wrapping back to the first step.
    const goToNextStep = () => {
        const idx = stepOrder.indexOf(step);
        setStep(stepOrder[(idx + 1) % stepOrder.length]);
    };

    const saveProfile = async () => {
        if (!accountComplete || !mentorProfile) return;

        setIsPreparingSave(true);
        try {
            const formData = new FormData();
            formData.append("occupation", draft.occupation);
            formData.append("bio", draft.bio);
            formData.append("nick_name", draft.nickname);
            formData.append("years_of_experience", String(parseInt(draft.experience, 10) || 0));
            formData.append("hourly_rate", draft.hourlyRate ? String(parseFloat(draft.hourlyRate)) : "");
            formData.append("language", draft.language);

            let bannerFile = draft.bannerFile;
            if (!bannerFile && draft.banner) {
                try {
                    const res = await fetch(draft.banner);
                    const blob = await res.blob();
                    bannerFile = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
                } catch (e) {
                    console.error("Could not re-fetch existing cover image", e);
                }
            }
            if (bannerFile) formData.append("cover_images", bannerFile);

            formData.append("categories", JSON.stringify(draft.categories));
            formData.append("expertise", JSON.stringify(draft.expertise));

            // Backend expects the singular key "social_link" as a flat object,
            // e.g. { twitter, linkedin, website } — NOT "social_links" as an array.
            const socialLink = {
                linkedin: draft.linkedin ? `https://linkedin.com/in/${draft.linkedin}` : "",
                twitter: draft.xHandle ? `https://x.com/${draft.xHandle}` : "",
                website: draft.website || "",
            };
            formData.append("social_link", JSON.stringify(socialLink));

            formData.append("availability", draft.availability);
            // daily_availability is a plain number of hours (e.g. "2"), not "2 hrs".
            formData.append("daily_availability", draft.dailyAvailability);

            // Backend field is "bank_details" (was "bank_account").
            formData.append(
                "bank_details",
                JSON.stringify({
                    bank_name: draft.bankName,
                    account_name: draft.accountName,
                    account_number: draft.accountNumber,
                    routing_or_sort_code: draft.routingOrSortCode,
                    currency: "NGN",
                })
            );

            updateMentor(formData, {
                onSuccess: () => {
                    addToast("Profile updated", "success");
                    setIsEditing(false);
                },
                onError: (error: any) => {
                    const message =
                        error?.response?.data?.message ||
                        error?.response?.data?.detail ||
                        "Something went wrong. Please try again.";
                    addToast(message, "error");
                },
            });
        } finally {
            setIsPreparingSave(false);
        }
    };


    const loading = mentorLoading || userLoading;
    const isSaving = isPending || isPreparingSave;

    if (loading) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <LoadingOverlay visible={true} />
            </div>
        );
    }

    if (!userProfile?.is_mentor) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 pt-40 text-center sm:px-6">
                    <div
                        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        <FiUserPlus size={45} className="text-[#5e5e5e]" />
                    </div>
                    <h1 className="text-2xl font-black sm:text-3xl">You're not a mentor yet</h1>
                    <p className="mt-3 mb-8 max-w-md text-sm text-white/40">
                        Create your mentor profile in a few quick steps to start sharing your expertise and get
                        discovered by mentees.
                    </p>
                    <Button variant="green" onClick={() => navigate("/dashboard/mentor/onboarding")}>
                        <span className="flex items-center gap-2">
                            <FiUserPlus size={15} />
                            Create Mentor Profile
                        </span>
                    </Button>
                </div>
            </div>
        );
    }

    // Gate: mentor profile exists but hasn't been approved yet.
    if (!mentorProfile?.is_approved) {
        return <NotVerifiedScreen onBack={() => navigate("/dashboard/overview")} />;
    }

    const categoryLabels: string[] = Array.isArray(mentorProfile?.categories) ? mentorProfile.categories : [];
    const expertiseLabels: string[] = Array.isArray(mentorProfile?.expertise) ? mentorProfile.expertise : [];
    const savedSocialLink = mentorProfile?.social_link ?? {};
    const savedLinkedin = extractHandle(savedSocialLink.linkedin);
    const savedXHandle = extractHandle(savedSocialLink.twitter);
    const savedWebsite: string = savedSocialLink.website ?? "";
    const savedAvailabilityLabel =
        AVAILABILITY_OPTIONS.find((o) => o.value === mentorProfile?.availability)?.label ?? "";
    const savedDailyAvailabilityLabel =
        mentorProfile?.daily_availability != null
            ? DAILY_AVAILABILITY_OPTIONS.find((o) => o.value === String(mentorProfile.daily_availability))?.label ??
            `${mentorProfile.daily_availability} hrs`
            : "";
    const bank = mentorProfile?.bank_details;

    return (
        <div className="min-h-screen w-full text-white" >
            <LoadingOverlay visible={isSaving} />
            <div className="mx-auto max-w-4xl ">
                {step === "professional" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Your Profile</h2>
                        <div className="space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Cover Photo</p>
                                <div className="relative mb-14 sm:mb-16">
                                    <div
                                        className="flex lg:h-40 h-20 w-full items-center justify-center overflow-hidden rounded-xl"
                                        style={{ background: cardBg, border: cardBorder }}
                                    >
                                        {(isEditing ? draft.banner : mentorProfile?.cover_images) ? (
                                            <img
                                                src={(isEditing ? draft.banner : mentorProfile?.cover_images) as string}
                                                alt="Cover"
                                                className="h-full w-full object-cover aspect-video"
                                            />
                                        ) : (
                                            <FiImage size={28} className="text-white/20" />
                                        )}
                                    </div>

                                    {isEditing && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => bannerInputRef.current?.click()}
                                                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                                                style={{ background: "rgba(0,0,0,0.6)" }}
                                            >
                                                <FiCamera size={13} />
                                                {draft.banner ? "Change Cover" : "Upload Cover"}
                                            </button>
                                            <input
                                                ref={bannerInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleBannerChange}
                                            />
                                        </>
                                    )}

                                    <div className="absolute -bottom-10 left-4 sm:-bottom-12 sm:left-6">
                                        <div
                                            className="flex bg-white p-1 lg:h-20 lg:w-20 h-16 w-16 items-center justify-center overflow-hidden rounded-xl"
                                        >
                                            {userProfile?.avatar ? (
                                                <img
                                                    src={userProfile.avatar}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover rounded-xl"
                                                />
                                            ) : (
                                                <FiUser size={26} className="text-white/20" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <p className="text-xs text-white/40">
                                        Cover: 1500×500 recommended. Want to change your profile photo instead? Head
                                        to{" "}
                                        <button
                                            type="button"
                                            onClick={() => navigate("/dashboard/settings")}
                                            className="font-semibold text-[#a6ff00] underline"
                                        >
                                            Settings
                                        </button>
                                        .
                                    </p>
                                )}
                            </div>

                            {isEditing ? (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Mentor Nickname"
                                            value={draft.nickname}
                                            onChange={(v) => setDraft((d) => ({ ...d, nickname: v }))}
                                            placeholder="Alex Mentor"
                                        />
                                        <Field
                                            label="Occupation"
                                            value={draft.occupation}
                                            onChange={(v) => setDraft((d) => ({ ...d, occupation: v }))}
                                            placeholder="Product Designer"
                                        />
                                    </div>
                                    <AreaField
                                        label="Bio"
                                        value={draft.bio}
                                        onChange={(v) => setDraft((d) => ({ ...d, bio: v }))}
                                        placeholder="Tell people who you are and what you help with"
                                        helper="This appears on your public mentor profile."
                                    />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <Field
                                            label="Years of Experience"
                                            value={draft.experience}
                                            onChange={(v) =>
                                                setDraft((d) => ({ ...d, experience: v.replace(/[^0-9]/g, "") }))
                                            }
                                            placeholder="e.g. 4"
                                        />
                                        <Field
                                            label="Hourly Rate"
                                            value={draft.hourlyRate}
                                            onChange={(v) =>
                                                setDraft((d) => ({ ...d, hourlyRate: v.replace(/[^0-9.]/g, "") }))
                                            }
                                            placeholder="e.g. 50"
                                            helper="In NGN."
                                        />
                                        <SelectField
                                            label="Language"
                                            value={draft.language}
                                            options={LANGUAGE_OPTIONS}
                                            onChange={(v) => setDraft((d) => ({ ...d, language: v }))}
                                            placeholder="Select a language"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <ViewRow label="Mentor Nickname" value={mentorProfile?.nick_name} />
                                        <ViewRow label="Occupation" value={mentorProfile?.occupation} />
                                    </div>
                                    <ViewRow label="Bio" value={mentorProfile?.bio} />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <ViewRow
                                            label="Years of Experience"
                                            value={
                                                mentorProfile?.years_of_experience != null
                                                    ? `${mentorProfile.years_of_experience} years`
                                                    : ""
                                            }
                                        />
                                        <ViewRow
                                            label="Hourly Rate"
                                            value={mentorProfile?.hourly_rate != null ? `₦${mentorProfile.hourly_rate}` : ""}
                                        />
                                        <ViewRow label="Language" value={mentorProfile?.language ?? ""} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- Category & Socials ---------------- */}
                {step === "social" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Category &amp; Social Links</h2>
                        <div className="space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Category</p>
                                {isEditing ? (
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORY_OPTIONS.map((cat) => {
                                            const active = draft.categories.includes(cat);
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
                                ) : categoryLabels.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {categoryLabels.map((label) => (
                                            <span
                                                key={label}
                                                className="inline-flex rounded-full bg-[#a6ff00] px-3.5 py-2 text-sm font-semibold capitalize text-black"
                                            >
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-white/30">Not set</p>
                                )}
                            </div>

                            {isEditing ? (
                                <MultiPillSelect
                                    label="Expertise"
                                    values={draft.expertise}
                                    options={EXPERTISE_OPTIONS}
                                    onChange={(v) => setDraft((d) => ({ ...d, expertise: v }))}
                                />
                            ) : (
                                <ViewChipsRow label="Expertise" values={expertiseLabels} />
                            )}

                            <div>
                                <p className="mb-3 text-sm font-semibold text-white">Social Links</p>
                                <div className="space-y-3">
                                    {isEditing ? (
                                        <>
                                            <SocialField
                                                badge="in"
                                                prefix="linkedin.com/in/"
                                                value={draft.linkedin}
                                                onChange={(v) => setDraft((d) => ({ ...d, linkedin: v }))}
                                                placeholder="yourname"
                                            />
                                            <SocialField
                                                badge="X"
                                                prefix="x.com/@"
                                                value={draft.xHandle}
                                                onChange={(v) => setDraft((d) => ({ ...d, xHandle: v }))}
                                                placeholder="yourhandle"
                                            />
                                            <Field
                                                label="Website"
                                                value={draft.website}
                                                onChange={(v) => setDraft((d) => ({ ...d, website: v }))}
                                                placeholder="https://yourwebsite.com"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ViewSocialRow
                                                badge="in"
                                                label="LinkedIn"
                                                url={`linkedin.com/in/${savedLinkedin}`}
                                                handle={savedLinkedin}
                                            />
                                            <ViewSocialRow
                                                badge="X"
                                                label="X (Twitter)"
                                                url={`x.com/@${savedXHandle}`}
                                                handle={savedXHandle}
                                            />
                                            <ViewRow label="Website" value={savedWebsite} placeholder="Not linked" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------- Availability ---------------- */}
                {step === "availability" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Availability</h2>
                        <div className="space-y-5">
                            {isEditing ? (
                                <>
                                    <PillSelect
                                        label="General Availability"
                                        value={draft.availability}
                                        options={AVAILABILITY_OPTIONS}
                                        onChange={(v) => setDraft((d) => ({ ...d, availability: v }))}
                                    />
                                    <PillSelect
                                        label="Hours Per Day"
                                        value={draft.dailyAvailability}
                                        options={DAILY_AVAILABILITY_OPTIONS}
                                        onChange={(v) => setDraft((d) => ({ ...d, dailyAvailability: v }))}
                                    />
                                </>
                            ) : (
                                <>
                                    <ViewRow label="General Availability" value={savedAvailabilityLabel} />
                                    <ViewRow label="Hours Per Day" value={savedDailyAvailabilityLabel} />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- Account Details ---------------- */}
                {step === "account" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Bank Details</h2>
                        <p className="mb-6 -mt-3 text-sm text-white/40">
                            We use these details to pay out your mentoring earnings.
                        </p>
                        <div className="space-y-5">
                            {isEditing ? (
                                <>
                                    <Field
                                        label="Bank Name"
                                        value={draft.bankName}
                                        onChange={(v) => setDraft((d) => ({ ...d, bankName: v }))}
                                        placeholder="e.g. GTBank"
                                    />
                                    <Field
                                        label="Account Name"
                                        value={draft.accountName}
                                        onChange={(v) => setDraft((d) => ({ ...d, accountName: v }))}
                                        placeholder="Name on the account"
                                    />
                                    <Field
                                        label="Account Number"
                                        value={draft.accountNumber}
                                        onChange={(v) =>
                                            setDraft((d) => ({ ...d, accountNumber: v.replace(/[^0-9]/g, "") }))
                                        }
                                        placeholder="0123456789"
                                        helper="10-digit NUBAN account number."
                                    />
                                    <Field
                                        label="Routing / Sort Code"
                                        value={draft.routingOrSortCode}
                                        onChange={(v) => setDraft((d) => ({ ...d, routingOrSortCode: v }))}
                                        placeholder="Optional — for non-NGN accounts"
                                        helper="Leave blank if not applicable."
                                    />
                                </>
                            ) : (
                                <>
                                    <ViewRow label="Bank Name" value={bank?.bank_name ?? ""} />
                                    <ViewRow label="Account Name" value={bank?.account_name ?? ""} />
                                    <ViewRow
                                        label="Account Number"
                                        value={bank?.account_number ? `••••••${bank.account_number.slice(-4)}` : ""}
                                    />
                                    <ViewRow label="Routing / Sort Code" value={bank?.routing_or_sort_code ?? ""} />
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------- Footer controls ---------------- */}
                <div className="mt-10 flex gap-3 sm:flex-row justify-between">
                    {isEditing ? (
                        <>
                            <Button variant="white" onClick={step === "professional" ? cancelEditing : goBack}>
                                <span className="flex items-center justify-center gap-2">
                                    {step === "professional" ? (
                                        <>
                                            <FiX size={15} />
                                            Cancel
                                        </>
                                    ) : (
                                        <>
                                            <FiArrowLeft size={15} />
                                            Previous
                                        </>
                                    )}
                                </span>
                            </Button>
                            {step !== "account" ? (
                                <Button
                                    variant="green"
                                    onClick={goNext}
                                    disabled={
                                        step === "professional"
                                            ? !professionalComplete
                                            : step === "social"
                                                ? !socialComplete
                                                : !availabilityComplete
                                    }
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Next
                                        <FiArrowRight size={15} />
                                    </span>
                                </Button>
                            ) : (
                                <Button
                                    variant="green"
                                    onClick={() => {
                                        void saveProfile();
                                    }}
                                    disabled={!accountComplete || isSaving}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <FiCheck size={15} />
                                        Save Changes
                                    </span>
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-3 justify-between">
                            <Button variant="white" onClick={goToNextStep}>
                                <span className="flex items-center justify-center gap-2">
                                    Next
                                    <FiArrowRight size={15} />
                                </span>
                            </Button>
                            <Button variant="green" onClick={startEditing}>
                                <span className="flex items-center justify-center gap-2">
                                    Edit Profile
                                    <FiEdit2 size={14} />
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorProfile;