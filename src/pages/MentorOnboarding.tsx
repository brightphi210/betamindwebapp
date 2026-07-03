import { useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiImage, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../component/ui/Button";

const CATEGORIES = ["Tech", "Finance", "Business", "Design", "Product", "Marketing", "Leadership", "Education"];

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

// Prefixed "handle" input, matching the instagram.com/ · x.com/ pattern in the reference
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

type Step = "professional" | "social" | "account";

const MentorOnboarding = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<Step>("professional");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [nickname, setNickname] = useState("");
    const [occupation, setOccupation] = useState("");
    const [bio, setBio] = useState("");
    const [experience, setExperience] = useState("");
    const [category, setCategory] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [xHandle, setXHandle] = useState("");

    // Bank details (Account Details step)
    const [bankName, setBankName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const professionalComplete = !!(nickname && occupation && bio && experience);
    const socialComplete = !!category;
    const accountComplete = !!(bankName && accountName && accountNumber);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setAvatar(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setBanner(URL.createObjectURL(file));
    };

    const goNext = () => {
        if (step === "professional") setStep("social");
        else if (step === "social") setStep("account");
    };

    const goBack = () => {
        if (step === "account") setStep("social");
        else if (step === "social") setStep("professional");
        else navigate("/dashboard/overview");
    };

    return (
        <div
            className="min-h-screen w-full text-white"
            style={{
                background:
                    "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
            }}
        >
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
                <div className="mb-10 flex items-center gap-6" style={{ borderBottom: cardBorder }}>
                    <span
                        className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${step === "professional" ? "border-[#a6ff00] text-white" : "border-transparent text-white/40"
                            }`}
                    >
                        Professional Info
                    </span>
                    <span
                        className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${step === "social" ? "border-[#a6ff00] text-white" : "border-transparent text-white/40"
                            }`}
                    >
                        Category &amp; Socials
                    </span>
                    <span
                        className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${step === "account" ? "border-[#a6ff00] text-white" : "border-transparent text-white/40"
                            }`}
                    >
                        Account Details
                    </span>
                </div>

                {step === "professional" && (
                    <div>
                        <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">Your Profile</h2>
                        <div className="space-y-5">
                            {/* Cover banner + overlapping avatar */}
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

                                    {/* Avatar overlapping bottom-left of banner */}
                                    <div className="absolute -bottom-10 left-4 sm:-bottom-12 sm:left-6">
                                        <div className="relative">
                                            <div
                                                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl sm:h-24 sm:w-24"
                                                style={{
                                                    background: cardBg,
                                                    border: "3px solid #05080340",
                                                    boxShadow: "0 0 0 2px rgba(166,255,0,.35)",
                                                }}
                                            >
                                                {avatar ? (
                                                    <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                                                ) : (
                                                    <FiUser size={26} className="text-white/20" />
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow"
                                            >
                                                <FiCamera size={13} />
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-white/40">
                                    Cover: 1500×500 recommended. Profile photo: PNG or JPG, up to 5MB.
                                </p>
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
                                label="Years of Experience"
                                value={experience}
                                onChange={setExperience}
                                placeholder="e.g. 4 years"
                            />
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
                                    {CATEGORIES.map((item) => {
                                        const active = category === item;
                                        return (
                                            <button
                                                key={item}
                                                type="button"
                                                onClick={() => setCategory(item)}
                                                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all ${active
                                                    ? "bg-[#a6ff00] text-black"
                                                    : "text-white hover:border-[#a6ff00] hover:text-[#a6ff00]"
                                                    }`}
                                                style={
                                                    active
                                                        ? undefined
                                                        : { background: cardBg, border: cardBorder }
                                                }
                                            >
                                                {item}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

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
                                </div>
                            </div>
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
                        </div>
                    </div>
                )}

                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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
                            onClick={() => navigate("/dashboard/overview")}
                            disabled={!accountComplete}
                        >
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