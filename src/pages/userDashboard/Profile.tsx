import { useEffect, useRef, useState } from "react";
import {
    FiArrowLeft,
    FiArrowRight,
    FiCamera,
    FiCheck,
    FiClock,
    FiEdit2,
    FiImage,
    FiShield,
    FiUser,
    FiUserPlus,
    FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import Button from "../../component/ui/Button";
import { useUpdateMentorProfile } from "../../hooks/mutations/allMutation";
import { useGetMyMentorProfile, useGetMyUserProfile } from "../../hooks/queries/allQueriess";
import { useGlobalContext } from "../../providers/GlobalContext";

type SocialLink = { platform: string; url: string; id?: string };

// Hardcoded category options for the button picker — no categories endpoint exists,
// and the backend stores these as plain strings (confirmed from GET response:
// categories: ["phones","laptops","tablets"]). Edit this list to match what you
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

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const prefixBg = "rgba(255,255,255,0.03)";

const fieldClass =
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";

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

const VerificationBadge: React.FC<{ isApproved: boolean }> = ({ isApproved }) =>
    isApproved ? (
        <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(166,255,0,0.1)", border: "1px solid rgba(166,255,0,.35)", color: "#a6ff00" }}
        >
            <FiShield size={13} />
            Verified Mentor
        </div>
    ) : (
        <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-400"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,.3)" }}
        >
            <FiClock size={13} />
            Verification Pending
        </div>
    );

const extractLink = (links: SocialLink[], platform: string) => links.find((l) => l.platform === platform);

const cleanHandle = (link?: SocialLink) => {
    if (!link) return "";
    const clean = link.url.replace(/\/$/, "");
    return clean.substring(clean.lastIndexOf("/") + 1).replace(/^@/, "");
};

type Step = "professional" | "social" | "account";

type Draft = {
    banner: string | null;
    bannerFile: File | null;
    nickname: string;
    occupation: string;
    bio: string;
    experience: string;
    categories: string[];
    linkedin: string;
    linkedinId?: string;
    xHandle: string;
    xHandleId?: string;
    bankId?: string;
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
    categories: [],
    linkedin: "",
    linkedinId: undefined,
    xHandle: "",
    xHandleId: undefined,
    bankId: undefined,
    bankName: "",
    accountName: "",
    accountNumber: "",
    routingOrSortCode: "",
};

const draftFromMentorProfile = (mentorProfile: any): Draft => {
    const links: SocialLink[] = mentorProfile?.social_links ?? [];
    const linkedin = extractLink(links, "linkedin");
    const twitter = extractLink(links, "twitter");

    return {
        banner: mentorProfile?.cover_images ?? null,
        bannerFile: null,
        nickname: mentorProfile?.nick_name ?? "",
        occupation: mentorProfile?.occupation ?? "",
        bio: mentorProfile?.bio ?? "",
        experience: mentorProfile?.years_of_experience != null ? String(mentorProfile.years_of_experience) : "",
        categories: mentorProfile?.categories ?? [],
        linkedin: cleanHandle(linkedin),
        linkedinId: linkedin?.id,
        xHandle: cleanHandle(twitter),
        xHandleId: twitter?.id,
        bankId: mentorProfile?.bank_account?.id,
        bankName: mentorProfile?.bank_account?.bank_name ?? "",
        accountName: mentorProfile?.bank_account?.account_name ?? "",
        accountNumber: mentorProfile?.bank_account?.account_number ?? "",
        routingOrSortCode: mentorProfile?.bank_account?.routing_or_sort_code ?? "",
    };
};

// ---------- Not verified gate screen ----------

const NotVerifiedScreen: React.FC<{ pageBackground: string; onBack: () => void }> = ({
    pageBackground,
    onBack,
}) => (
    <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 pt-40 text-center sm:px-6">
            <div
                className="mb-6 flex h-25 w-25 items-center justify-center rounded-2xl bg-neutral-900"
            >
                <FiClock size={50} className="text-emerald-300-400" />
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
    const accountComplete = !!(draft.bankName && draft.accountName && draft.accountNumber);

    const goNext = () => {
        if (step === "professional") setStep("social");
        else if (step === "social") setStep("account");
    };
    const goBack = () => {
        if (step === "account") setStep("social");
        else if (step === "social") setStep("professional");
    };

    const saveProfile = async () => {
        if (!accountComplete || !mentorProfile) return;

        setIsPreparingSave(true);
        try {
            const socialLinks = [
                draft.linkedin && {
                    id: draft.linkedinId,
                    platform: "linkedin",
                    url: `https://linkedin.com/in/${draft.linkedin}`,
                },
                draft.xHandle && {
                    id: draft.xHandleId,
                    platform: "twitter",
                    url: `https://x.com/${draft.xHandle}`,
                },
            ].filter(Boolean);

            const formData = new FormData();
            formData.append("occupation", draft.occupation);
            formData.append("bio", draft.bio);
            formData.append("nick_name", draft.nickname);
            formData.append("years_of_experience", String(parseInt(draft.experience, 10) || 0));
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
            formData.append(
                "bank_account",
                JSON.stringify({
                    id: draft.bankId,
                    bank_name: draft.bankName,
                    account_name: draft.accountName,
                    account_number: draft.accountNumber,
                    routing_or_sort_code: draft.routingOrSortCode,
                    currency: "NGN",
                })
            );
            formData.append("social_links", JSON.stringify(socialLinks));

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

    const stepIndex = { professional: 0, social: 1, account: 2 }[step];
    const stepLabels: Record<Step, string> = {
        professional: "Professional Info",
        social: "Category & Socials",
        account: "Account Details",
    };

    const pageBackground =
        "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

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
        return (
            <NotVerifiedScreen
                pageBackground={pageBackground}
                onBack={() => navigate("/dashboard/overview")}
            />
        );
    }

    const categoryLabels: string[] = mentorProfile?.categories ?? [];
    const savedLinks: SocialLink[] = mentorProfile?.social_links ?? [];
    const savedLinkedin = cleanHandle(extractLink(savedLinks, "linkedin"));
    const savedXHandle = cleanHandle(extractLink(savedLinks, "twitter"));
    const bank = mentorProfile?.bank_account;

    return (
        <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
            <LoadingOverlay visible={isSaving} />
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/overview")}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Mentor Profile</h1>
                            <VerificationBadge isApproved={!!mentorProfile?.is_approved} />
                        </div>
                        <p className="mt-3 max-w-2xl text-sm text-white/40 sm:text-base">
                            {isEditing
                                ? "Update your professional background, category, and payout details."
                                : "Here's how your profile looks. Edit any section whenever you need to."}
                        </p>
                    </div>
                </div>

                <div className="mb-10 flex items-center gap-6" style={{ borderBottom: cardBorder }}>
                    {(["professional", "social", "account"] as Step[]).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => (!isEditing ? setStep(s) : undefined)}
                            disabled={isEditing && s !== step}
                            className={`border-b-2 pb-3 text-xs font-semibold transition-colors ${step === s ? "border-[#a6ff00] text-white" : "border-transparent text-white/40"
                                } ${!isEditing ? "cursor-pointer hover:text-white" : ""} ${isEditing && s !== step ? "cursor-not-allowed opacity-40" : ""
                                }`}
                        >
                            {stepLabels[s]}
                        </button>
                    ))}
                </div>

                {/* ---------------- Professional Info ---------------- */}
                {step === "professional" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Your Profile</h2>
                        <div className="space-y-5">
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Cover Photo</p>
                                <div className="relative mb-14 sm:mb-16">
                                    <div
                                        className="flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl sm:h-44"
                                        style={{ background: cardBg, border: cardBorder }}
                                    >
                                        {(isEditing ? draft.banner : mentorProfile?.cover_images) ? (
                                            <img
                                                src={(isEditing ? draft.banner : mentorProfile?.cover_images) as string}
                                                alt="Cover"
                                                className="h-full w-full object-cover"
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
                                            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl sm:h-24 sm:w-24"
                                            style={{
                                                background: cardBg,
                                                border: "3px solid #05080340",
                                                boxShadow: "0 0 0 2px rgba(166,255,0,.35)",
                                            }}
                                        >
                                            {userProfile?.avatar ? (
                                                <img
                                                    src={userProfile.avatar}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
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
                                    <Field
                                        label="Years of Experience"
                                        value={draft.experience}
                                        onChange={(v) =>
                                            setDraft((d) => ({ ...d, experience: v.replace(/[^0-9]/g, "") }))
                                        }
                                        placeholder="e.g. 4"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <ViewRow label="Mentor Nickname" value={mentorProfile?.nick_name} />
                                        <ViewRow label="Occupation" value={mentorProfile?.occupation} />
                                    </div>
                                    <ViewRow label="Bio" value={mentorProfile?.bio} />
                                    <ViewRow
                                        label="Years of Experience"
                                        value={
                                            mentorProfile?.years_of_experience != null
                                                ? `${mentorProfile.years_of_experience} years`
                                                : ""
                                        }
                                    />
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
                                        </>
                                    )}
                                </div>
                            </div>
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
                                </>
                            ) : (
                                <>
                                    <ViewRow label="Bank Name" value={bank?.bank_name ?? ""} />
                                    <ViewRow label="Account Name" value={bank?.account_name ?? ""} />
                                    <ViewRow
                                        label="Account Number"
                                        value={bank?.account_number ? `••••••${bank.account_number.slice(-4)}` : ""}
                                    />
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
                                    disabled={step === "professional" ? !professionalComplete : !socialComplete}
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
                        <>
                            <span className="text-xs text-white/30">
                                Step {stepIndex + 1} of 3 — {stepLabels[step]}
                            </span>
                            <Button variant="green" onClick={startEditing}>
                                <span className="flex items-center justify-center gap-2">
                                    <FiEdit2 size={14} />
                                    Edit Profile
                                </span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MentorProfile;