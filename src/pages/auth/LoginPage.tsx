import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../component/layout/AuthLayout";
import Button from "../../component/ui/Button";
import Input from "../../component/ui/Input";
import GoogleAuthButton from "../../component/GoogleAuthButton";

const OrDivider = () => (
  <div className="flex items-center gap-4 my-3">
    <div
      className="flex-1 h-px"
      style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
    />
    <span className="text-gray-500 text-xs tracking-widest uppercase">or</span>
    <div
      className="flex-1 h-px"
      style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
    />
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const mockToken = "mock-token-" + Date.now();
    localStorage.setItem("betamindToken", mockToken);
    localStorage.setItem("user", JSON.stringify({ email }));
    setTimeout(() => navigate("/dashboard/overview"), 500);
  };

  return (
    <AuthLayout
      title="Welcome to Betamind"
      subtitle="Sign up or log in to your account"
    >
      <GoogleAuthButton />
      <OrDivider />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Email Address"
          type="email"
          id="login-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="primary"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </form>
      <div className="flex justify-between mt-1">
        <Link
          to="/forgot-password"
          className="text-[var(--color-primary)] text-xs hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          to="/signup"
          className="text-[var(--color-primary)] text-xs hover:underline"
        >
          Sign up
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
