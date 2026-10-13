import React from "react";
import { FiArrowRight, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import PoweredByBadge from "../../component/PowereByBadge";
import PublicNavbar from "../../component/PublicNavbar";

const EventSuccess: React.FC = () => {
    return (
        <div
            className="flex min-h-screen w-full flex-col"
            style={{
                background:
                    "radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)",
            }}
        >
            <PublicNavbar />

            <div className="flex flex-1 items-center justify-center px-4 py-10 pt-24 sm:pt-32">
                <div className="w-full max-w-sm p-6 text-center sm:p-8">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#a6ff00]/15 text-[#a6ff00]">
                        <FiCheckCircle size={32} />
                    </div>

                    <h1 className="text-2xl font-black text-white">
                        You're registered!
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">
                        Your event registration is confirmed. Keep an eye on
                        your inbox for updates, ticket details, and reminders
                        from the host.
                    </p>

                    <div
                        className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            style={{
                                background: "rgba(166,255,0,0.1)",
                                color: "#a6ff00",
                            }}
                        >
                            <FiCalendar size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                                What's next
                            </p>
                            <p className="text-xs text-white/40">
                                Check your email for confirmation and event info
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <Link
                            to="/dashboard/explore"
                            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
                        >
                            Explore more events
                        </Link>
                        <Link
                            to="/dashboard/overview"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            Go to dashboard
                            <FiArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            <PoweredByBadge />
        </div>
    );
};

export default EventSuccess;