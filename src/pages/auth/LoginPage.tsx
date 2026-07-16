import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/beta1.png";
import loginImage from "../../assets/loginImage.jpeg";
import GoogleAuthButton from "../../component/GoogleAuthButton";
import MyButton from "../../component/ui/Button";

const OrDivider = () => (
  <div className="my-4 flex items-center gap-4">
    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
    <span className="text-xs uppercase tracking-widest text-gray-500">or</span>
    <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
  </div>
);

const AUTH_PANEL_GRADIENT =
  'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7))'

const inputBaseClass =
  "w-full rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 outline-none transition-colors";
const inputBorderStyle = { border: "1px solid rgba(255,255,255,0.15)" };

const handleFocusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "#a6ff00";
};
const handleBlurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
};

const EmailContinueForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/onboarding");
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email Address"
        className={inputBaseClass}
        style={inputBorderStyle}
        onFocus={handleFocusBorder}
        onBlur={handleBlurBorder}
      />

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={`${inputBaseClass} pr-11`}
          style={inputBorderStyle}
          onFocus={handleFocusBorder}
          onBlur={handleBlurBorder}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      <MyButton variant="white" fullWidth onClick={handleContinue}>
        Continue
      </MyButton>

    </div>
  );
};

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full text-white"
      style={{
        background:
          'radial-gradient(ellipse 400px 500px at 50% -150px, rgba(205, 220, 57, 0.05), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.85) 0%, #000000 60%)',
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-center lg:px-8 lg:py-8">
        {/* Mobile: full-bleed radial-gradient hero, no bordered card */}
        <div className="w-full lg:hidden lg:-mx-4 -mt-4 sm:-mx-6">
          <div
            className="lg:px-6 px-4 pt-8 pb-10 sm:px-8"
          // style={{ background: AUTH_PANEL_GRADIENT }}
          >
            <div className="mb-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm">
              <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
            </div>

            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold leading-tight">Welcome Back!</h1>
              <p className="text-sm text-gray-300">Continue your journey with us.</p>
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

        {/* Desktop: split card, image left / gradient auth panel right */}
        <div className="hidden w-full max-w-4xl overflow-hidden rounded-[10px] border border-white/10 shadow-2xl lg:flex">
          <div className="relative w-[46%] min-h-[500px]">
            <img src={loginImage} alt="Atmosphere" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-8 pt-24">
              <h2 className="mb-2 text-3xl font-bold leading-tight text-white">Enter the Atmosphere.</h2>
              <p className="text-sm text-gray-300">Join an ecosystem where knowledge meets ambition.</p>
            </div>
          </div>

          <div
            className="flex w-[54%] flex-col justify-center px-10 py-10 xl:px-12"
            style={{ background: AUTH_PANEL_GRADIENT }}
          >
            <div className="mb-8 flex h-7 w-7 items-center justify-center overflow-hidden rounded-sm">
              <img src={logo} alt="Betamind Logo" className="h-full w-full object-cover" />
            </div>

            <div className="mb-6">
              <h1 className="mb-1 text-2xl font-bold leading-tight text-white">Welcome Back!</h1>
              <p className="text-sm text-gray-400">Continue your journey with us.</p>
            </div>

            <GoogleAuthButton />
            <OrDivider />
            <EmailContinueForm />

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-xs text-white transition-colors hover:underline">
                Forgot password?
              </Link>
              <Link to="/signup" className="text-xs text-white transition-colors hover:underline">
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