import { useMemo } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/Button";

const BURST_COLORS = ["#a6ff00", "#7ee6c0", "#ff8fb0", "#8f8fff"];

const SuccessBurst: React.FC = () => {
    const particles = useMemo(
        () =>
            Array.from({ length: 20 }, (_, i) => {
                const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.3;
                const dist = 95 + Math.random() * 55;
                return {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    size: 6 + Math.random() * 6,
                    color: BURST_COLORS[i % BURST_COLORS.length],
                    delay: 0.55 + Math.random() * 0.12,
                    round: i % 2 === 0,
                };
            }),
        []
    );

    return (
        <div className="relative flex h-30 w-44 items-center justify-center">
            {particles.map((p, i) => (
                <span
                    key={i}
                    className="sb-particle absolute"
                    style={{
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        borderRadius: p.round ? "9999px" : "2px",
                        animationDelay: `${p.delay}s`,
                        ["--x" as string]: `${p.x}px`,
                        ["--y" as string]: `${p.y}px`,
                    }}
                />
            ))}

            <svg viewBox="0 0 100 100" className="sb-pop h-24 w-32">
                <circle className="sb-fill" cx="50" cy="50" r="44" fill="rgba(166,255,0,0.12)" />
                <circle
                    className="sb-ring"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#a6ff00"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <path
                    className="sb-check"
                    d="M30 52 L44 66 L71 36"
                    pathLength={60}
                    fill="none"
                    stroke="#a6ff00"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>

            <style>{`
                .sb-ring {
                    stroke-dasharray: 277;
                    stroke-dashoffset: 277;
                    transform: rotate(-90deg);
                    transform-origin: 50% 50%;
                    animation: sbDraw 0.6s ease-out forwards;
                }
                .sb-check {
                    stroke-dasharray: 60;
                    stroke-dashoffset: 60;
                    animation: sbDraw 0.4s ease-out 0.5s forwards;
                }
                .sb-fill {
                    opacity: 0;
                    animation: sbFade 0.4s ease-out 0.5s forwards;
                }
                .sb-pop {
                    animation: sbPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s both;
                }
                .sb-particle {
                    opacity: 0;
                    animation: sbParticle 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }
                @keyframes sbDraw { to { stroke-dashoffset: 0; } }
                @keyframes sbFade { to { opacity: 1; } }
                @keyframes sbPop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes sbParticle {
                    0% { opacity: 1; transform: translate(0, 0) scale(0.3) rotate(0deg); }
                    100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(1) rotate(220deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .sb-ring, .sb-check, .sb-fill, .sb-pop { animation: none; stroke-dashoffset: 0; opacity: 1; }
                    .sb-particle { display: none; }
                }
            `}</style>
        </div>
    );
};

type MentorOnboardingSuccessProps = {
    productName?: string;
};

const MentorOnboardingSuccess: React.FC<MentorOnboardingSuccessProps> = ({
    productName = "Mentorship",
}) => {
    const navigate = useNavigate();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 text-white"
            style={{
                background:
                    "radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)",
            }}
        >
            <div className="flex w-full max-w-xs flex-col items-center text-center">
                <SuccessBurst />

                <h1 className="mt-2 text-xl font-black text-white">You are a star! 🎉</h1>
                <p className="pt-2 text-sm text-white/80">
                    You can now accept mentees on <span className="font-semibold text-white">{productName}</span>
                </p>

                <div className="mt-6 flex w-full flex-col gap-3">
                    <Button variant="green" onClick={() => navigate("/dashboard/overview")}>
                        <span className="flex items-center justify-center gap-2">
                            Dashboard
                            <FiArrowRight size={12} />
                        </span>
                    </Button>

                    <Button variant="white" onClick={() => navigate("/dashboard/profile")}>
                        <span className="flex items-center justify-center gap-2">
                            Mentor profile
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MentorOnboardingSuccess;