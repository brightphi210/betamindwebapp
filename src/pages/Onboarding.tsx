import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCamera, FiCheck, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/beta1.png";
import InterestPicker from "../component/InterestPicker";
import LoadingOverlay from "../component/LoadingOverlay";
import Button from "../component/ui/Button";
import { useUpdateUserProfile } from "../hooks/mutations/allMutation";
import { useGetInterests, useGetMyUserProfile } from "../hooks/queries/allQueriess";
import { useGlobalContext } from "../providers/GlobalContext";
import { getApiErrorMessage, prepareAvatar } from "../utils/avatar";
import { createCustomInterest, extractInterestIds, HARD_CODED_INTERESTS, mergeOptions, normalizeInterests } from "../utils/interest";

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";
const fieldClass =
  "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#a6ff00]";
const pageBackground =
  "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)";

const STEPS = [
  { title: "About you", hint: "Tell us who you are." },
  { title: "Where you're based", hint: "Helps us connect you with the right people." },
  { title: "Your interests", hint: "Pick what you'd like to learn or teach. We'll tailor Explore around them." },
];

type FormState = {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
};

type ErrorState = Partial<Record<keyof FormState | "interests" | "avatar", string>>;

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const Field = ({
  label, value, onChange, placeholder, type = "text", error,
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
      inputMode={type === "tel" ? "numeric" : undefined}
      value={value}
      onChange={(e) => onChange(type === "tel" ? e.target.value.replace(/\D/g, "") : e.target.value)}
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
  const { interests: interestsRes, isLoading: interestsLoading } = useGetInterests();
  const [customInterests, setCustomInterests] = useState<any[]>([]);
  const allInterests = useMemo(
    () => mergeOptions(normalizeInterests(interestsRes?.data ?? HARD_CODED_INTERESTS), customInterests),
    [customInterests, interestsRes]
  );
  const { mutate: updateProfile, isPending } = useUpdateUserProfile();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const hydrated = useRef(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"fwd" | "back">("fwd");
  const [errors, setErrors] = useState<ErrorState>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>({
    first_name: "", last_name: "", phone_number: "", address: "", city: "", country: "",
  });

  // Prefill ONCE. Re-running on every refetch (e.g. after the file picker closes)
  // used to wipe what the user was typing.
  useEffect(() => {
    if (hydrated.current || !userProfile || interestsLoading) return;
    hydrated.current = true;
    setForm({
      first_name: userProfile.first_name ?? "",
      last_name: userProfile.last_name ?? "",
      phone_number: userProfile.phone_number ?? "",
      address: userProfile.address ?? "",
      city: userProfile.city ?? "",
      country: userProfile.country ?? "",
    });
    setSelectedIds(extractInterestIds(userProfile.interests, allInterests));
    setAvatarPreview(userProfile.avatar ?? null);
  }, [userProfile, interestsLoading, allInterests]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const set = (key: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the user re-pick the same file after an error
    if (!file) return;

    try {
      const prepared = await prepareAvatar(file);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(prepared);
      objectUrlRef.current = url;
      setAvatarPreview(url);
      setAvatarFile(prepared);
      setErrors((e) => ({ ...e, avatar: undefined }));
    } catch (err: any) {
      addToast(err?.message || "Couldn't use that image.", "error");
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
    setErrors((e) => ({ ...e, interests: undefined }));
  };

  const handleAddCustomInterest = (value: string) => {
    const nextInterest = createCustomInterest(value);
    if (!nextInterest) return;

    setCustomInterests((existing) => {
      const alreadyExists = existing.some((item) => item.id === nextInterest.id) ||
        HARD_CODED_INTERESTS.some((item) => item.id === nextInterest.id || item.name.toLowerCase() === nextInterest.name.toLowerCase());
      if (alreadyExists) {
        setSelectedIds((ids) => (ids.includes(nextInterest.id) ? ids : [...ids, nextInterest.id]));
        return existing;
      }

      setSelectedIds((ids) => (ids.includes(nextInterest.id) ? ids : [...ids, nextInterest.id]));
      return [nextInterest, ...existing];
    });
  };

  const validateStep = (): boolean => {
    const next: ErrorState = {};
    if (step === 0) {
      if (!avatarPreview && !avatarFile) next.avatar = "Profile photo is required";
      if (!form.first_name.trim()) next.first_name = "First name is required";
      if (!form.last_name.trim()) next.last_name = "Last name is required";
      const digits = form.phone_number.replace(/\D/g, "");
      if (!digits) next.phone_number = "Phone number is required";
      else if (digits.length < 10) next.phone_number = "Phone number must be at least 10 digits";
    }
    if (step === 1) {
      if (!form.city.trim()) next.city = "City is required";
      if (!form.country.trim()) next.country = "Country is required";
    }
    if (step === 2 && selectedIds.length === 0) next.interests = "Pick at least one interest";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setDirection("fwd");
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setDirection("back");
    setStep((s) => s - 1);
  };

  const handleFinish = () => {
    if (isPending || !validateStep()) return;

    const formData = new FormData();
    formData.append("first_name", form.first_name.trim());
    formData.append("last_name", form.last_name.trim());
    formData.append("phone_number", form.phone_number.trim());
    formData.append("address", form.address.trim());
    formData.append("city", form.city.trim());
    formData.append("country", form.country.trim());
    selectedIds.forEach((id) => formData.append("interest_ids", id));
    if (avatarFile) formData.append("avatar", avatarFile);

    updateProfile(formData, {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        addToast("Profile completed. Welcome aboard!", "success");
        navigate("/dashboard/overview", { replace: true });
      },
      onError: (error: any) => addToast(getApiErrorMessage(error), "error"),
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
  const stepAnim = direction === "fwd" ? "anim-step-fwd" : "anim-step-back";

  return (
    <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
      <LoadingOverlay visible={isPending} />
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Logo */}
        <div
          className="anim-fade-up mb-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm lg:mb-8 lg:h-7 lg:w-7"
          style={delay(0)}
        >
          <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
        </div>

        {/* Progress */}
        <div className="anim-fade-up mb-8" style={delay(80)}>
          <div className="mb-3 flex items-center justify-between text-xs text-white/50">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{STEPS[step].title}</span>
          </div>
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: i <= step ? "100%" : "0%", background: "#a6ff00" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Heading + step content re-animate whenever the step changes */}
        <div key={step} className={stepAnim}>
          <div className="mb-8">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              {step === 0 ? "Complete your profile" : STEPS[step].title}
            </h1>
            <p className="mt-3 text-sm text-white/40 sm:text-base">{STEPS[step].hint}</p>
          </div>

          <div className="space-y-6">
            {step === 0 && (
              <>
                <div>
                  <p className="mb-2 text-sm font-semibold text-white">Profile Photo</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                        style={{ background: cardBg, border: errors.avatar ? "1px solid rgba(248,113,113,.6)" : cardBorder }}
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
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-black shadow transition-transform hover:scale-110"
                      >
                        <FiCamera size={13} />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <p className="text-xs text-white/40">JPG, PNG or WebP, up to 7MB.</p>
                  </div>
                  {errors.avatar && <p className="mt-2 text-xs text-red-400">{errors.avatar}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First Name" value={form.first_name} onChange={set("first_name")} placeholder="Bright" error={errors.first_name} />
                  <Field label="Last Name" value={form.last_name} onChange={set("last_name")} placeholder="Philip" error={errors.last_name} />
                </div>
                <Field label="Phone Number" type="tel" value={form.phone_number} onChange={set("phone_number")} placeholder="08012345678" error={errors.phone_number} />
              </>
            )}

            {step === 1 && (
              <>
                <Field label="Address (optional)" value={form.address} onChange={set("address")} placeholder="Street address" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="City" value={form.city} onChange={set("city")} placeholder="Port Harcourt" error={errors.city} />
                  <Field label="Country" value={form.country} onChange={set("country")} placeholder="Nigeria" error={errors.country} />
                </div>
              </>
            )}

            {step === 2 && (
              <InterestPicker
                interests={allInterests}
                selected={selectedIds}
                onToggle={toggleInterest}
                onAddCustom={handleAddCustomInterest}
                isLoading={interestsLoading}
                error={errors.interests}
              />
            )}
          </div>
        </div>

        <div className="anim-fade-up mt-10 flex items-center justify-between" style={delay(320)}>
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
            >
              <FiArrowLeft size={15} />
              Back
            </button>
          ) : (
            <span />
          )}

          {isLast ? (
            <Button variant="green" onClick={handleFinish} disabled={isPending || interestsLoading}>
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