import React from "react";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

const SessionBookedSuccess: React.FC = () => {
    return (
        <div
            className="flex min-h-screen w-full items-center justify-center px-4 py-10"
            style={{
                background:
                    "radial-gradient(ellipse 500px 500px at 50% -100px, rgba(166, 255, 0, 0.10), rgba(0, 4, 2, 0.7)), linear-gradient(180deg, rgba(6, 10, 4, 0.9) 0%, #000000 60%)",
            }}
        >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#a6ff00]/15 text-[#a6ff00]">
                    <FiCheckCircle size={32} />
                </div>

                <h1 className="text-3xl font-black text-white">Session booked successfully</h1>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                    Your session request has been created. You can keep exploring or view your bookings anytime.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        to="/dashboard/explore"
                        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
                    >
                        Explore
                    </Link>
                    <Link
                        to="/dashboard/bookings"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                    >
                        My Bookings
                        <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SessionBookedSuccess;
