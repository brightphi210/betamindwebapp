import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiCamera, FiCheck, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import Button from "../../component/ui/Button";
import { useGetMyUserProfile } from "../../hooks/queries/allQueriess";
// ASSUMPTION: adjust to your real update-profile mutation hook
import { useUpdateUserProfile } from "../../hooks/mutations/allMutation";
import { useGlobalContext } from "../../providers/GlobalContext";

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const fieldClass =
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";

const Field: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}> = ({ label, value, onChange, placeholder, type = "text" }) => (
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
    </div>
);

type FormState = {
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    city: string;
    country: string;
};

const SettingsPage = () => {
    const navigate = useNavigate();
    const { addToast } = useGlobalContext();
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const { myProfile, isLoading } = useGetMyUserProfile();
    const userProfile = myProfile?.data;

    const { mutate: updateProfile, isPending } = useUpdateUserProfile();

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [form, setForm] = useState<FormState>({
        first_name: "",
        last_name: "",
        phone_number: "",
        address: "",
        city: "",
        country: "",
    });

    // Populate the form once the profile loads
    useEffect(() => {
        if (userProfile) {
            setForm({
                first_name: userProfile.first_name ?? "",
                last_name: userProfile.last_name ?? "",
                phone_number: userProfile.phone_number ?? "",
                address: userProfile.address ?? "",
                city: userProfile.city ?? "",
                country: userProfile.country ?? "",
            });
            setAvatarPreview(userProfile.avatar ?? null);
        }
    }, [userProfile]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarFile(file);
        }
    };

    const handleSave = () => {
        const formData = new FormData();
        formData.append("first_name", form.first_name);
        formData.append("last_name", form.last_name);
        formData.append("phone_number", form.phone_number);
        formData.append("address", form.address);
        formData.append("city", form.city);
        formData.append("country", form.country);
        if (avatarFile) formData.append("avatar", avatarFile);

        updateProfile(formData, {
            onSuccess: () => addToast("Settings updated", "success"),
            onError: (error: any) => {
                const message =
                    error?.response?.data?.message ||
                    error?.response?.data?.detail ||
                    "Something went wrong. Please try again.";
                addToast(message, "error");
            },
        });
    };

    const pageBackground =
        "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center text-white/50" style={{ background: pageBackground }}>
                Loading settings…
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
            <LoadingOverlay visible={isPending} />
            <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/overview")}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                <div className="mb-8">
                    <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Settings</h1>
                    <p className="mt-3 max-w-2xl text-sm text-white/40 sm:text-base">
                        Update your personal details and profile photo.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Avatar */}
                    <div>
                        <p className="mb-2 text-sm font-semibold text-white">Profile Photo</p>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div
                                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                                    style={{ background: cardBg, border: cardBorder }}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <FiUser size={26} className="text-white/20" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow"
                                >
                                    <FiCamera size={13} />
                                </button>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <p className="text-xs text-white/40">PNG or JPG, up to 5MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="First Name"
                            value={form.first_name}
                            onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
                            placeholder="Bright"
                        />
                        <Field
                            label="Last Name"
                            value={form.last_name}
                            onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
                            placeholder="Philip"
                        />
                    </div>

                    <Field
                        label="Phone Number"
                        value={form.phone_number}
                        onChange={(v) => setForm((f) => ({ ...f, phone_number: v }))}
                        placeholder="+234 800 000 0000"
                        type="tel"
                    />

                    <Field
                        label="Address"
                        value={form.address}
                        onChange={(v) => setForm((f) => ({ ...f, address: v }))}
                        placeholder="Street address"
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="City"
                            value={form.city}
                            onChange={(v) => setForm((f) => ({ ...f, city: v }))}
                            placeholder="Port Harcourt"
                        />
                        <Field
                            label="Country"
                            value={form.country}
                            onChange={(v) => setForm((f) => ({ ...f, country: v }))}
                            placeholder="Nigeria"
                        />
                    </div>
                </div>

                <div className="mt-10 flex justify-end">
                    <Button variant="green" onClick={handleSave} disabled={isPending}>
                        <span className="flex items-center justify-center gap-2">
                            <FiCheck size={15} />
                            Save Changes
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;