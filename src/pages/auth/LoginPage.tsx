import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/beta1.png";
import loginImage from "../../assets/upload2.jpg";
import GoogleAuthButton from "../../component/GoogleAuthButton";
import MyButton from "../../component/ui/Button";
import { useLogin } from "../../hooks/mutations/auth";
import { useGlobalContext } from "../../providers/GlobalContext";
import { parseApiError, saveTokens, type FieldErrors } from "../../types/auth";
import {
  EMAIL_RE,
  FieldError,
  OrDivider,
  handleBlurBorder,
  handleFocusBorder,
  inputBaseClass,
  inputStyle,
} from "./AuthShared";

const EmailContinueForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const navigate = useNavigate();
  const { addToast } = useGlobalContext();
  const { mutate, isPending } = useLogin();

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: FieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address";
    if (!password) next.password = "Password is required";
    setErrors(next);
    if (Object.keys(next).length) return;

    mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: (res: any) => {
          if (!saveTokens(res)) {
            addToast("Login failed. Please try again.", "error");
            return;
          }
          navigate("/dashboard/overview");
        },
        onError: (err: any) => {
          const { message, fieldErrors } = parseApiError(err);
          // Wrong credentials usually come back as a general message, so toast it.
          if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
          else addToast(message, "error");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError("email");
          }}
          placeholder="Email Address"
          autoComplete="email"
          className={inputBaseClass}
          style={inputStyle(!!errors.email)}
          data-invalid={errors.email ? "true" : undefined}
          onFocus={handleFocusBorder}
          onBlur={handleBlurBorder}
        />
        <FieldError message={errors.email} />
      </div>

      <div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            placeholder="Password"
            autoComplete="current-password"
            className={`${inputBaseClass} pr-11`}
            style={inputStyle(!!errors.password)}
            data-invalid={errors.password ? "true" : undefined}
            onFocus={handleFocusBorder}
            onBlur={handleBlurBorder}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white/40"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
        <FieldError message={errors.password} />
      </div>

      <MyButton type="submit" variant="green" fullWidth isLoading={isPending}>
        Continue
      </MyButton>
    </form>
  );
};

const LoginPage = () => {
  return (
    <div
      className="min-h-screen w-full text-white"
      style={{
        background:
          "radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:px-8 lg:py-8">
        {/* Mobile: full-bleed radial-gradient hero, no bordered card */}
        <div className="w-full lg:hidden lg:-mx-4 -mt-4 sm:-mx-6">
          <div className="lg:px-6 px-4 pt-8 pb-10 sm:px-8">
            <div className="mb-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm">
              <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
            </div>

            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold leading-tight">Hey, Betamind!</h1>
              <p className="text-sm text-white/40">Monetize your knowledge, gain affordable mentorship</p>
            </div>

            <GoogleAuthButton />
            <OrDivider />
            <EmailContinueForm />

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-white transition-colors hover:underline">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-white transition-colors hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop: split card, image left / auth panel right */}
        <div className="hidden w-full max-w-4xl overflow-hidden rounded-[10px] border border-white/10 shadow-2xl lg:flex">
          <div className="relative min-h-[500px] w-[46%]">
            <img src={loginImage} alt="Atmosphere" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-24">
              <h2 className="mb-2 text-xl font-bold leading-tight text-white">Enter the Atmosphere.</h2>
              <p className="text-sm text-white/40">Join an ecosystem where knowledge meets ambition.</p>
            </div>
          </div>

          <div className="flex w-[54%] flex-col justify-center bg-neutral-950 px-10 py-10 xl:px-12">
            <div className="mb-8 flex h-7 w-7 items-center justify-center overflow-hidden rounded-sm">
              <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
            </div>

            <div className="mb-8">
              <h1 className="mb-1 text-3xl font-bold leading-tight">Hey, Betamind!</h1>
              <p className="text-base text-white/40">Monetize your knowledge, gain affordable mentorship</p>
            </div>

            <GoogleAuthButton />
            <OrDivider />
            <EmailContinueForm />

            <div className="mt-2 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-xs text-white/60 transition-colors hover:underline">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-xs text-white/60 transition-colors hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;