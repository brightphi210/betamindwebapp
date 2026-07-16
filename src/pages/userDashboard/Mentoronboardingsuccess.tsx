import { useMemo } from "react";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Button from "../../component/ui/Button";

const cardBg = "rgba(255,255,255,0.02)";
const cardBorder = "1px solid rgba(205,220,57,.08)";

const BUBBLE_COLORS = ["#a6ff00", "#7ee6c0", "#ff8fb0", "#8f8fff"];

type Bubble = {
    id: number;
    left: number; // vw
    size: number; // px
    color: string;
    duration: number; // s
    delay: number; // s
    drift: number; // px, horizontal sway
    opacity: number;
};

const BUBBLE_COUNT = 26;

const makeBubbles = (): Bubble[] =>
    Array.from({ length: BUBBLE_COUNT }, (_, id) => ({
        id,
        left: Math.random() * 100,
        size: 6 + Math.random() * 16,
        color: BUBBLE_COLORS[id % BUBBLE_COLORS.length],
        duration: 9 + Math.random() * 10,
        delay: Math.random() * -14,
        drift: Math.random() * 60 - 30,
        opacity: 0.25 + Math.random() * 0.5,
    }));

const BubbleSplash: React.FC<{ bubbles: Bubble[] }> = ({ bubbles }) => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {bubbles.map((b) => (
            <span
                key={b.id}
                className="absolute rounded-full bubble-float"
                style={{
                    left: `${b.left}vw`,
                    bottom: "-10%",
                    width: b.size,
                    height: b.size,
                    background: b.color,
                    opacity: b.opacity,
                    boxShadow: `0 0 ${b.size}px ${b.color}55`,
                    // custom props consumed by the keyframe below
                    ["--drift" as string]: `${b.drift}px`,
                    animationDuration: `${b.duration}s`,
                    animationDelay: `${b.delay}s`,
                }}
            />
        ))}
        <style>{`
            @keyframes bubbleFloat {
                0% {
                    transform: translate(0, 0) scale(0.6);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--drift), -120vh) scale(1);
                    opacity: 0;
                }
            }
            .bubble-float {
                animation-name: bubbleFloat;
                animation-timing-function: ease-in;
                animation-iteration-count: infinite;
            }
            @media (prefers-reduced-motion: reduce) {
                .bubble-float {
                    animation: none;
                    opacity: 0.15 !important;
                }
            }
        `}</style>
    </div>
);

const PartyIcon = () => (
    <svg width="100" height="100" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14 50L26 22L42 38L14 50Z"
            fill="#a6ff00"
            stroke="#a6ff00"
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path d="M30 18L34 10" stroke="#a6ff00" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 14L42 6" stroke="#7ee6c0" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M46 24L54 22" stroke="#ff8fb0" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="22" cy="10" r="2" fill="#7ee6c0" />
        <circle cx="52" cy="34" r="2" fill="#8f8fff" />
        <path
            d="M32 30 L38 28 M35 36 L42 35 M38 42 L44"
            stroke="#a6ff00"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="46" cy="12" r="1.6" fill="#ff8fb0" />
    </svg>
);

type MentorOnboardingSuccessProps = {
    /** e.g. the mentor's chosen category/product line — shown in the subtitle */
    productName?: string;
};

const MentorOnboardingSuccess: React.FC<MentorOnboardingSuccessProps> = ({
    productName = "Mentorship",
}) => {
    const navigate = useNavigate();
    const bubbles = useMemo(makeBubbles, []);

    return (
        <div
            className="relative min-h-screen w-full overflow-hidden text-white"
            style={{
                background:
                    "radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)",
            }}
        >
            <BubbleSplash bubbles={bubbles} />

            <div className="relative z-10 flex min-h-screen w-full justify-center px-4 py-16 pt-24">
                <div className="w-full max-w-md text-center">
                    <div
                        className="mx-auto mb-6 text-5xl flex items-center justify-center rounded-2xl"
                    >
                        <PartyIcon />
                    </div>

                    <h1 className="text-4xl font-black leading-tight sm:text-5xl">You are a star!</h1>
                    <p className="mt-3 text-sm text-white/50 sm:text-base">
                        You can now accept mentees on <span className="font-semibold text-white">{productName}</span>
                    </p>

                    <div
                        className="mt-8 rounded-2xl p-6 text-left"
                        style={{ background: cardBg, border: cardBorder }}
                    >
                        <p className="mb-5 text-center text-sm text-white/50">
                            Your mentor profile is live. Head to your dashboard to manage sessions and availability.
                        </p>

                        <div className="justify-center m-auto gap-2 flex">

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
            </div>
        </div>
    );
};

export default MentorOnboardingSuccess;