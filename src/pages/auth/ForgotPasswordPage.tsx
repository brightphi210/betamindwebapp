import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import { useGlobalContext } from "../../providers/GlobalContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useGlobalContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSent(true);
      addToast("Reset link sent to your email", "success");
    }, 1500);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-white/50 text-xs">
        Enter the email address associated with your account and we&apos;ll send
        you a link to reset your password.
      </p>
      <Input
        label="Email Address"
        type="email"
        id="forgot-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Button type="submit" fullWidth variant="primary" isLoading={isLoading}>
        Send Reset Link
      </Button>
    </form>
  );

  const sentContent = (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-14 h-14 rounded-full bg-[#DBFF00]/10 border border-[#DBFF00]/30 flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#DBFF00"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h3 className="text-white text-lg font-bold">Check your email</h3>
      <p className="text-white/50 text-sm text-center max-w-xs">
        If an account exists for {email}, we&apos;ve sent a password reset link.
      </p>
      <Button
        variant="primary"
        fullWidth
        onClick={() => setSent(false)}
      >
        Send again
      </Button>
    </div>
  );

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you a link to reset it"
    >
      {sent ? sentContent : formContent}
      <p className="text-center text-white/50 text-xs mt-3">
        <Link
          to="/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
