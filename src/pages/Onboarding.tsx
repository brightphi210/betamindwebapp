import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiPlus, FiUser, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/beta1.png";
import LoadingOverlay from "../component/LoadingOverlay";
import Button from "../component/ui/Button";
import { useUpdateUserProfile } from "../hooks/mutations/allMutation";
import { useGetMyUserProfile } from "../hooks/queries/allQueriess";
import { useGlobalContext } from "../providers/GlobalContext";

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const fieldClass =
  "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";
const pageBackground =
  "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

const MAX_AVATAR_SIZE_BYTES = 7 * 1024 * 1024; // 7MB

const SUGGESTED_INTERESTS = [
  "Software Development",
  "Product Design",
  "Data & AI",
  "Marketing",
  "Entrepreneurship",
  "Finance",
  "Content Creation",
  "Career Growth",
  "Leadership",
  "Public Speaking",
  "Writing",
  "Health & Wellness",
];

const STEPS = [
  { title: "About you", hint: "Tell us who you are." },
  { title: "Where you're based", hint: "Helps us connect you with the right people." },
  { title: "Your interests", hint: "Pick what you'd like to learn or teach." },
];

type FormState = {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
  interests: string[];
};

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={fieldClass}
      style={{ background: cardBg, border: error ? "1px solid rgba(248,113,113,.6)" : cardBorder }}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useGlobalContext();
  const { myProfile, isLoading } = useGetMyUserProfile();
  const userProfile = myProfile?.data;
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [customInterest, setCustomInterest] = useState("");
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    country: "",
    interests: [],
  });

  // Prefill anything we already know (e.g. name from Google)
  useEffect(() => {
    if (!userProfile) return;
    setForm({
      first_name: userProfile.first_name ?? "",
      last_name: userProfile.last_name ?? "",
      phone_number: userProfile.phone_number ?? "",
      address: userProfile.address ?? "",
      city: userProfile.city ?? "",
      country: userProfile.country ?? "",
      interests: Array.isArray(userProfile.interests) ? userProfile.interests : [],
    });
    setAvatarPreview(userProfile.avatar ?? null);
  }, [userProfile]);

  const set = (key: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      addToast("Profile photo must be 7MB or smaller.", "error");
      e.target.value = "";
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const toggleInterest = (interest: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter((i) => i !== interest)
        : [...f.interests, interest],
    }));
    setErrors((e) => ({ ...e, interests: undefined }));
  };

  const addCustomInterest = () => {
    const value = customInterest.trim();
    if (!value) return;
    const exists = form.interests.some((i) => i.toLowerCase() === value.toLowerCase());
    if (!exists) toggleInterest(value);
    setCustomInterest("");
  };

  const validateStep = (): boolean => {
    const next: typeof errors = {};
    if (step === 0) {
      if (!form.first_name.trim()) next.first_name = "First name is required";
      if (!form.last_name.trim()) next.last_name = "Last name is required";
      if (!form.phone_number.trim()) next.phone_number = "Phone number is required";
    }
    if (step === 1) {
      if (!form.city.trim()) next.city = "City is required";
      if (!form.country.trim()) next.country = "Country is required";
    }
    if (step === 2 && form.interests.length === 0) {
      next.interests = "Pick at least one interest";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleFinish = () => {
    if (!validateStep()) return;

    const formData = new FormData();
    formData.append("first_name", form.first_name.trim());
    formData.append("last_name", form.last_name.trim());
    formData.append("phone_number", form.phone_number.trim());
    formData.append("address", form.address.trim());
    formData.append("city", form.city.trim());
    formData.append("country", form.country.trim());
    form.interests.forEach((i) => formData.append("interests", i));
    if (avatarFile) formData.append("avatar", avatarFile);

    updateProfile(formData, {
      onSuccess: async (res: any) => {
        await queryClient.invalidateQueries();
        addToast("Profile completed. Welcome aboard!", "success");
        console.log("This is the response", res);
        navigate("/dashboard/overview", { replace: true });
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Something went wrong. Please try again.";
        addToast(message, "error");
      },
    });
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center text-white/50"
        style={{ background: pageBackground }}
      >
        Loading…
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
      <LoadingOverlay visible={isPending} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Logo */}
        <div className="mb-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm lg:mb-8 lg:h-7 lg:w-7">
          <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs text-white/50">
            <span>
              Step {step + 1} of {STEPS.length}
            </span>
            <span>{STEPS[step].title}</span>
          </div>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? "#a6ff00" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            {step === 0 ? "Complete your profile" : STEPS[step].title}
          </h1>
          <p className="mt-3 text-sm text-white/40 sm:text-base">{STEPS[step].hint}</p>
        </div>

        <div className="space-y-6">
          {step === 0 && (
            <>
              {/* Avatar */}
              <div>
                <p className="mb-2 text-sm font-semibold text-white">Profile Photo (optional)</p>
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
                      aria-label="Upload profile photo"
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
                  <p className="text-xs text-white/40">PNG or JPG, up to 7MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="Bright"
                  error={errors.first_name}
                />
                <Field
                  label="Last Name"
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Philip"
                  error={errors.last_name}
                />
              </div>
              <Field
                label="Phone Number"
                type="tel"
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="08012345678"
                error={errors.phone_number}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Field
                label="Address (optional)"
                value={form.address}
                onChange={set("address")}
                placeholder="Street address"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  value={form.city}
                  onChange={set("city")}
                  placeholder="Port Harcourt"
                  error={errors.city}
                />
                <Field
                  label="Country"
                  value={form.country}
                  onChange={set("country")}
                  placeholder="Nigeria"
                  error={errors.country}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-wrap gap-2.5">
                {SUGGESTED_INTERESTS.map((interest) => {
                  const selected = form.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      aria-pressed={selected}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                      style={{
                        background: selected ? "rgba(166,255,0,0.12)" : cardBg,
                        border: selected ? "1px solid #a6ff00" : cardBorder,
                        color: selected ? "#a6ff00" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {selected && <FiCheck size={13} />}
                      {interest}
                    </button>
                  );
                })}
                {/* Custom interests the user added */}
                {form.interests
                  .filter((i) => !SUGGESTED_INTERESTS.includes(i))
                  .map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
                      style={{
                        background: "rgba(166,255,0,0.12)",
                        border: "1px solid #a6ff00",
                        color: "#a6ff00",
                      }}
                    >
                      {interest}
                      <FiX size={13} />
                    </button>
                  ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Something else?
                </label>
                <div className="flex gap-2">
                  <input
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomInterest();
                      }
                    }}
                    placeholder="Add your own interest"
                    className={fieldClass}
                    style={{ background: cardBg, border: cardBorder }}
                  />
                  <button
                    type="button"
                    onClick={addCustomInterest}
                    aria-label="Add interest"
                    className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-white text-black"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/40">{form.interests.length} selected</p>
              {errors.interests && <p className="text-xs text-red-400">{errors.interests}</p>}
            </>
          )}
        </div>

        <div className="mt-10 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
            >
              <FiArrowLeft size={15} />
              Back
            </button>
          ) : (
            <span />
          )}

          {isLast ? (
            <Button variant="green" onClick={handleFinish} disabled={isPending}>
              <span className="flex items-center justify-center gap-2">
                <FiCheck size={15} />
                Finish
              </span>
            </Button>
          ) : (
            <Button variant="green" onClick={handleNext}>
              <span className="flex items-center justify-center gap-2">
                Continue
                <FiArrowRight size={15} />
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;