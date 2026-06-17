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

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      navigate("/verify-email");
    }, 500);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the Betamind ecosystem"
    >
      <GoogleAuthButton />
      <OrDivider />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Full Name"
          type="text"
          id="signup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        <Input
          label="Email Address"
          type="email"
          id="signup-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          id="signup-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          fullWidth
          variant="primary"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>
      <p className="text-center text-white/50 text-xs mt-1">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignupPage;
