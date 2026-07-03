import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";
import Button from "../../component/ui/Button";
import { useGlobalContext } from "../../providers/GlobalContext";

const VerifyEmailPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useGlobalContext();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleVerified = () => {
    const mockToken = "mock-token-" + Date.now();
    localStorage.setItem("betamindToken", mockToken);
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "user@betamind.com", name: "User" })
    );
    setUser({ email: "user@betamind.com", name: "User" });
    navigate("/onboarding");
  };

  const loadingContent = (
    <div className="flex flex-col items-center gap-4 py-8">
      <svg
        className="animate-spin"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(219,255,0,0.2)"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#DBFF00"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-white/70 text-sm">Sending verification email...</p>
    </div>
  );

  const verifiedContent = (
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
        We&apos;ve sent a verification link to your email address. Please check
        your inbox and click the link to verify your account.
      </p>
      <div className="flex flex-col gap-3 w-full mt-2">
        <Button variant="white" fullWidth>
          Open email app
        </Button>
        <Button variant="green" fullWidth onClick={handleVerified}>
          I have verified
        </Button>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One last step to get started"
    >
      {isLoading ? loadingContent : verifiedContent}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
