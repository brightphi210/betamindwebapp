import { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiImage } from "react-icons/fi";
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

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const prefixBg = "rgba(255,255,255,0.03)";

const fieldClass =
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";

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

// Single-select pill group — used for availability and daily availability hours.
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

type Step = "professional" | "social" | "availability" | "account";

const stepOrder: Step[] = ["professional", "social", "availability", "account"];

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

    // Categories — button picker from a fixed list, same pattern as MentorProfile.tsx
    const [categories, setCategories] = useState<string[]>([]);
    const [expertise, setExpertise] = useState<string[]>([]);

    const [linkedin, setLinkedin] = useState("");
    const [xHandle, setXHandle] = useState("");
    const [website, setWebsite] = useState("");

    // Availability
    const [availability, setAvailability] = useState("");
    const [dailyAvailability, setDailyAvailability] = useState("");

    // Bank details (Account Details step)
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [routingOrSortCode, setRoutingOrSortCode] = useState("");

    const professionalComplete = !!(nickname && occupation && bio && experience);
    const socialComplete = categories.length > 0;
    const availabilityComplete = !!(availability && dailyAvailability);
    const accountComplete = !!(bankName && accountName && accountNumber);

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
        if (!accountComplete) return;

        const formData = new FormData();
        formData.append("occupation", occupation);
        formData.append("bio", bio);
        formData.append("nick_name", nickname);
        formData.append("years_of_experience", String(parseInt(experience, 10) || 0));
        formData.append("hourly_rate", hourlyRate ? String(parseFloat(hourlyRate)) : "");
        formData.append("language", language);

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

        formData.append("availability", availability);
        // daily_availability is a plain number of hours (e.g. "2"), not "2 hrs".
        formData.append("daily_availability", dailyAvailability);

        // Bank details as a nested "bank_details" JSON object — sending these as
        // flat top-level fields (bank_name, account_name, ...) was previously
        // resulting in bank_details: null on the server, since the backend reads
        // a single "bank_details" field and json.loads()s it itself.
        formData.append(
            "bank_details",
            JSON.stringify({
                bank_name: bankName,
                account_name: accountName,
                account_number: accountNumber,
                routing_or_sort_code: routingOrSortCode,
                currency: "NGN",
            })
        );

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
        account: "Account Details",
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
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                {/* Page header */}
                <div className="mb-8">
                    <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Become a mentor</h1>
                    <p className="mt-3 max-w-2xl text-sm text-white/40 sm:text-base">
                        Share your professional background first, then set up your payout details.
                    </p>
                </div>

                {/* Step tabs */}
                <div className="mb-10 flex items-center gap-6 flex-wrap" style={{ borderBottom: cardBorder }}>
                    {stepOrder.map((s) => (
                        <span
                            key={s}
                            className={`border-b-2 pb-3 text-xs font-semibold transition-colors ${step === s ? "border-[#a6ff00] text-white" : "border-transparent text-white/40"
                                }`}
                        >
                            {stepLabels[s]}
                        </span>
                    ))}
                </div>

                {step === "professional" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Your Profile</h2>
                        <div className="space-y-5">
                            {/* Cover banner */}
                            <div>
                                <p className="mb-2 text-sm font-semibold text-white">Cover Photo</p>
                                <div className="relative mb-14 sm:mb-16">
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
                        <div className="space-y-5">
                            <PillSelect
                                label="General Availability"
                                value={availability}
                                options={AVAILABILITY_OPTIONS}
                                onChange={setAvailability}
                            />
                            <PillSelect
                                label="Hours Per Day"
                                value={dailyAvailability}
                                options={DAILY_AVAILABILITY_OPTIONS}
                                onChange={setDailyAvailability}
                            />
                        </div>
                    </div>
                )}

                {step === "account" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Bank Details</h2>
                        <p className="mb-6 -mt-3 text-sm text-white/40">
                            We use these details to pay out your mentoring earnings.
                        </p>
                        <div className="space-y-5">
                            <Field
                                label="Bank Name"
                                value={bankName}
                                onChange={setBankName}
                                placeholder="e.g. GTBank"
                            />
                            <Field
                                label="Account Name"
                                value={accountName}
                                onChange={setAccountName}
                                placeholder="Name on the account"
                            />
                            <Field
                                label="Account Number"
                                value={accountNumber}
                                onChange={(v) => setAccountNumber(v.replace(/[^0-9]/g, ""))}
                                placeholder="0123456789"
                                helper="10-digit NUBAN account number."
                            />
                            <Field
                                label="Routing / Sort Code"
                                value={routingOrSortCode}
                                onChange={setRoutingOrSortCode}
                                placeholder="Optional — for non-NGN accounts"
                                helper="Leave blank if not applicable."
                            />
                        </div>
                    </div>
                )}

                <div className="mt-10 flex  gap-3 sm:flex-row justify-between">
                    <Button variant="white" onClick={goBack}>
                        <span className="flex items-center justify-center gap-2">
                            {step !== "professional" && <FiArrowLeft size={15} />}
                            {step === "professional" ? "Cancel" : "Previous"}
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
                        <Button variant="green" onClick={handleFinish} disabled={!accountComplete || isPending}>
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