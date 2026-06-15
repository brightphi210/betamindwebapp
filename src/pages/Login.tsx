import { useGoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import logo from '../assets/beta1.png';
import loginImage from "../assets/loginImage.jpeg";
import SolidButtons from "../component/btns/Buttons";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const emailActive = emailFocused || email.length > 0;
    const passwordActive = passwordFocused || password.length > 0;

    const navigate = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            setError("");
            try {
                // Fetch the user's profile using the access token
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                    },
                });
                const user = await res.json();
                console.log("Google user:", user);
                // user = { sub, name, email, picture, ... }

                // TODO: Send user/token to your backend to create a session
                // await yourApi.loginWithGoogle({ token: tokenResponse.access_token, user });

                localStorage.setItem("user", JSON.stringify(user));
                console.log("Token response:", tokenResponse);
                localStorage.setItem("betamindToken", tokenResponse.access_token);
                navigate("/dashboard/overview");
            } catch (err) {
                setError("Failed to get user info. Please try again.");
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: (err) => {
            console.error("Google login failed:", err);
            setError("Google sign-in was cancelled or failed.");
        },
    });

    const GoogleButton = ({ rounded = "rounded-lg" }) => (
        <button
            onClick={() => {
                setError("");
                handleGoogleLogin();
            }}
            disabled={googleLoading}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-5 ${rounded} font-medium text-white text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
            style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
            {googleLoading ? (
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
            {googleLoading ? "Signing in..." : "Continue with Google"}
        </button>
    );

    const ErrorMessage = () => error ? (
        <p className="text-xs text-red-400 text-center -mt-1">{error}</p>
    ) : null;

    return (
        <div className="min-h-screen w-full" style={{ backgroundColor: "#010C06" }}>

            {/* ── MOBILE LAYOUT ── */}
            <div
                className="flex flex-col min-h-screen lg:hidden"
                style={{
                    background: "linear-gradient(170deg, #4a8a1a 0%, #1a3a0e 20%, #050f05 50%, #010C06 100%)",
                }}
            >
                <nav className="flex items-center justify-between px-6 pt-12 pb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 cursor-pointer">
                            <div className="w-9 rounded-sm flex items-center justify-center overflow-hidden">
                                <img src={logo} alt="Betamind Logo" className="w-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="text-white/40 text-sm font-medium hover:text-white transition-colors">Terms</button>
                        <button className="text-white/40 text-sm font-medium hover:text-white transition-colors">Help</button>
                    </div>
                </nav>

                <div className="px-6 pt-10 pb-8">
                    <h1 className="text-white text-2xl font-bold leading-tight mb-2">Welcome to Betamind</h1>
                    <p className="text-gray-400 text-sm">Sign up or log in to your account</p>
                </div>

                <div className="px-6 flex flex-col gap-3">
                    <GoogleButton rounded="rounded-lg" />
                    <ErrorMessage />

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                        <span className="text-gray-500 text-xs tracking-widest uppercase">or</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="email-mobile"
                            className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
                            style={{
                                top: emailActive ? "8px" : "50%",
                                transform: emailActive ? "translateY(0)" : "translateY(-50%)",
                                fontSize: emailActive ? "11px" : "12px",
                                color: emailActive ? "#DBFF00" : "rgba(156,163,175,1)",
                            }}
                        >
                            Email Address
                        </label>
                        <input
                            id="email-mobile"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            className="w-full rounded-lg px-4 text-white text-sm outline-none transition-all duration-200"
                            style={{
                                paddingTop: emailActive ? "22px" : "14px",
                                paddingBottom: emailActive ? "6px" : "14px",
                                backgroundColor: "rgba(255,255,255,0.07)",
                                border: `1px solid ${emailActive ? "#DBFF00" : "rgba(255,255,255,0.12)"}`,
                                minHeight: "50px",
                            }}
                            autoComplete="email"
                        />
                    </div>

                    <div className="relative">
                        <label
                            htmlFor="password-mobile"
                            className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
                            style={{
                                top: passwordActive ? "8px" : "50%",
                                transform: passwordActive ? "translateY(0)" : "translateY(-50%)",
                                fontSize: passwordActive ? "11px" : "12px",
                                color: passwordActive ? "#DBFF00" : "rgba(156,163,175,1)",
                            }}
                        >
                            Password
                        </label>
                        <input
                            id="password-mobile"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            className="w-full rounded-lg px-4 text-white text-sm outline-none transition-all duration-200"
                            style={{
                                paddingTop: passwordActive ? "22px" : "14px",
                                paddingBottom: passwordActive ? "6px" : "14px",
                                backgroundColor: "rgba(255,255,255,0.07)",
                                border: `1px solid ${passwordActive ? "#DBFF00" : "rgba(255,255,255,0.12)"}`,
                                minHeight: "50px",
                            }}
                            autoComplete="current-password"
                        />
                    </div>

                    <SolidButtons text="Continue" />
                </div>
            </div>

            {/* ── DESKTOP LAYOUT ── */}
            <div className="hidden lg:flex items-center justify-center min-h-screen">
                <div className="w-full max-w-4xl mx-auto flex lg:flex-row lg:rounded-2xl overflow-hidden">
                    <div className="lg:w-[50%]">
                        <div className="w-full h-full rounded-lb-2xl overflow-hidden relative" style={{ minHeight: "520px" }}>
                            <img src={loginImage} alt="Atmosphere" className="w-full h-full object-cover absolute inset-0" />
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/90 to-transparent">
                                <h2 className="text-white text-2xl font-bold leading-tight mb-1">Enter the Atmosphere.</h2>
                                <p className="text-gray-300 text-sm">Join an ecosystem where knowledge meets ambition.</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex-1 flex flex-col justify-center px-12 py-12"
                        style={{ background: "linear-gradient(160deg, #1a3a1a 0%, #2d4a1a 30%, #010C06 100%)" }}
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-1 cursor-pointer">
                                <div className="w-6 h-6 rounded-sm flex items-center justify-center overflow-hidden">
                                    <img src={logo} alt="Betamind Logo" className="w-full object-cover" />
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <button className="text-gray-400 text-xs hover:text-white transition-colors">Terms</button>
                                <button className="text-gray-400 text-xs hover:text-white transition-colors">Help</button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h1 className="text-white text-2xl font-bold leading-tight mb-1">Welcome to Betamind</h1>
                            <p className="text-gray-400 text-sm">Sign up or log in to your account</p>
                        </div>

                        <GoogleButton rounded="rounded-lg" />
                        <div className="mt-3"><ErrorMessage /></div>

                        <div className="flex items-center gap-4 mb-4 mt-4">
                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                            <span className="text-gray-400 text-xs tracking-widest uppercase">or</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                        </div>

                        <div className="relative mb-3">
                            <label
                                htmlFor="email-desktop"
                                className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
                                style={{
                                    top: emailActive ? "8px" : "50%",
                                    transform: emailActive ? "translateY(0)" : "translateY(-50%)",
                                    fontSize: emailActive ? "11px" : "12px",
                                    color: emailActive ? "#DBFF00" : "rgba(156,163,175,1)",
                                }}
                            >
                                Email Address
                            </label>
                            <input
                                id="email-desktop"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                className="w-full rounded-lg px-4 text-white text-sm outline-none transition-all duration-200"
                                style={{
                                    paddingTop: emailActive ? "22px" : "14px",
                                    paddingBottom: emailActive ? "6px" : "14px",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    border: `1px solid ${emailActive ? "#DBFF00" : "rgba(255,255,255,0.15)"}`,
                                    minHeight: "50px",
                                }}
                                autoComplete="email"
                            />
                        </div>

                        <div className="relative mb-5">
                            <label
                                htmlFor="password-desktop"
                                className="absolute left-4 pointer-events-none transition-all duration-200 font-medium"
                                style={{
                                    top: passwordActive ? "8px" : "50%",
                                    transform: passwordActive ? "translateY(0)" : "translateY(-50%)",
                                    fontSize: passwordActive ? "11px" : "12px",
                                    color: passwordActive ? "#DBFF00" : "rgba(156,163,175,1)",
                                }}
                            >
                                Password
                            </label>
                            <input
                                id="password-desktop"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                className="w-full rounded-lg px-4 text-white text-sm outline-none transition-all duration-200"
                                style={{
                                    paddingTop: passwordActive ? "22px" : "14px",
                                    paddingBottom: passwordActive ? "6px" : "14px",
                                    backgroundColor: "rgba(255,255,255,0.08)",
                                    border: `1px solid ${passwordActive ? "#DBFF00" : "rgba(255,255,255,0.15)"}`,
                                    minHeight: "50px",
                                }}
                                autoComplete="current-password"
                            />
                        </div>

                        <SolidButtons text="Continue" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;