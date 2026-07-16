import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSendGoogleToken } from "../hooks/mutations/auth";
import { useGlobalContext } from "../providers/GlobalContext";

interface GoogleAuthButtonProps {
  text?: string;
  loadingText?: string;
  rounded?: string;
}

const GoogleAuthButton = ({
  text = "Continue with Google",
  loadingText = "Signing in...",
  rounded = "rounded-lg",
}: GoogleAuthButtonProps) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { addToast } = useGlobalContext();
  const navigate = useNavigate();
  const { mutate, isPending } = useSendGoogleToken();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      addToast("Google sign-in failed. Please try again.", "error");
      return;
    }

    console.log("Google credential received:", credentialResponse);

    setGoogleLoading(true);

    mutate(
      { id_token: credentialResponse.credential },
      {
        onSuccess: (data: any) => {
          localStorage.setItem("betamindToken", data?.data?.tokens?.access);
          console.log("Google token sent successfully. Response data:", data?.data?.tokens?.access);
          navigate("/dashboard/overview");
        },
        onError: (e: any) => {
          console.error("Error sending Google token:", e?.response?.data);
          const message =
            e?.response?.data?.message ||
            e?.response?.data?.detail ||
            "Something went wrong. Please try again.";
          addToast(message, "error");
        },
        onSettled: () => {
          setGoogleLoading(false);
        },
      }
    );
  };

  const handleError = () => {
    addToast("Google sign-in was cancelled or failed.", "error");
  };

  const isLoading = googleLoading || isPending;

  return (
    <div className="relative w-full">
      {/* Real Google button — invisible, stretched over the custom button to capture the click */}
      <div className="absolute inset-0 z-10 overflow-hidden opacity-0">
        <div className="w-full h-full [&>div]:w-full [&>div]:h-full [&_iframe]:w-full! [&_iframe]:h-full!">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap={false}
          />
        </div>
      </div>

      {/* Custom styled button — purely visual, sits behind the real button */}
      <button
        type="button"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 ${rounded} font-medium text-white text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed relative`}
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        {isLoading ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107" />
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.000 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00" />
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50" />
            <path d="M43.611 20.083H42V20H24v8h11.303a11.996 11.996 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2" />
          </svg>
        )}
        {isLoading ? loadingText : text}
      </button>
    </div>
  );
};

export default GoogleAuthButton;