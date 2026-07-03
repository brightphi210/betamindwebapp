import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import { useGlobalContext } from "../../providers/GlobalContext";

const PasswordResetPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useGlobalContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast("Password reset successfully", "success");
      navigate("/login");
    }, 1000);
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        subtitle="This password reset link is invalid or has expired"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-14 h-14 rounded-full bg-[#FF3D00]/10 border border-[#FF3D00]/30 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF3D00"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-white/50 text-sm text-center max-w-xs">
            The password reset link you used is invalid or has already been used.
            Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-[var(--color-primary)] text-sm hover:underline"
          >
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="New Password"
          type="password"
          id="reset-new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Input
          label="Confirm Password"
          type="password"
          id="reset-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="green"
          isLoading={isLoading}
        >
          Reset Password
        </Button>
      </form>
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

export default PasswordResetPage;
