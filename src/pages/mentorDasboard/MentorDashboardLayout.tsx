import { useEffect } from "react";
import { FiArrowLeft, FiBarChart2, FiCalendar, FiClock, FiCreditCard, FiShield, FiUser, FiUserPlus } from "react-icons/fi";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../component/LoadingOverlay";
import { cardBg, cardBorder, pageBackground } from "../../component/MentorDashboardStyles";
import Button from "../../component/ui/Button";
import { useGetMyMentorProfile, useGetMyUserProfile } from "../../hooks/queries/allQueriess";

// Everything a child page (Overview, Wallet, Bookings, Profile) needs is passed
// down through this context, via useOutletContext<MentorDashboardContext>().
export type MentorDashboardContext = {
    mentorProfile: any;
    userProfile: any;
};

const NAV_ITEMS = [
    { to: "overview", label: "Overview", icon: <FiBarChart2 size={15} /> },
    { to: "wallet", label: "Wallet", icon: <FiCreditCard size={15} /> },
    { to: "bookings", label: "Bookings", icon: <FiCalendar size={15} /> },
    { to: "profile", label: "Profile", icon: <FiUser size={15} /> },
];

const VerificationBadge: React.FC<{ isApproved: boolean }> = ({ isApproved }) =>
    isApproved ? (
        <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{ background: "rgba(166,255,0,0.1)", border: "1px solid rgba(166,255,0,.35)", color: "#a6ff00" }}
        >
            <FiShield size={13} />
            Verified Mentor
        </div>
    ) : (
        <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-400"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,.3)" }}
        >
            <FiClock size={13} />
            Verification Pending
        </div>
    );

const NotVerifiedScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 pt-40 text-center sm:px-6">
        <div className="mb-6 flex h-25 w-25 items-center justify-center rounded-2xl bg-neutral-900">
            <FiClock size={50} className="text-emerald-400" />
        </div>
        <h1 className="text-xl font-black sm:text-2xl px-4">Your mentor profile isn't verified yet</h1>
        <p className="mt-3 mb-8 max-w-md text-xs px-4 text-white/40">
            Thanks for submitting your mentor application. Our team is reviewing your details and you'll be notified
            as soon as your profile is approved. Once verified, you'll get full access to your mentor dashboard.
        </p>
        <Button variant="green" onClick={onBack}>
            <span className="flex items-center gap-2">
                <FiArrowLeft size={15} />
                Back to Dashboard
            </span>
        </Button>
    </div>
);

const NotAMentorScreen: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 pt-40 text-center sm:px-6">
        <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: cardBg, border: cardBorder }}
        >
            <FiUserPlus size={45} className="text-[#5e5e5e]" />
        </div>
        <h1 className="text-2xl font-black sm:text-3xl">You're not a mentor yet</h1>
        <p className="mt-3 mb-8 max-w-md text-sm text-white/40">
            Create your mentor profile in a few quick steps to start sharing your expertise and get discovered by
            mentees.
        </p>
        <Button variant="green" onClick={onCreate}>
            <span className="flex items-center gap-2">
                <FiUserPlus size={15} />
                Create Mentor Profile
            </span>
        </Button>
    </div>
);

const MentorDashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { myMentorProfile, isLoading: mentorLoading } = useGetMyMentorProfile();
    const { myProfile, isLoading: userLoading } = useGetMyUserProfile();
    const mentorProfile = myMentorProfile?.data;
    const userProfile = myProfile?.data;

    const loading = mentorLoading || userLoading;

    // Default tab: if we've landed on the bare dashboard path (no tab segment
    // matched, e.g. "/dashboard/mentor"), send the user to Overview.
    useEffect(() => {
        if (loading) return;
        if (!userProfile?.is_mentor || !mentorProfile?.is_approved) return;

        const isOnATab = NAV_ITEMS.some((item) => location.pathname.endsWith(`/${item.to}`));
        if (!isOnATab) {
            navigate("overview", { replace: true });
        }
    }, [loading, userProfile?.is_mentor, mentorProfile?.is_approved, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <LoadingOverlay visible={true} />
            </div>
        );
    }

    if (!userProfile?.is_mentor) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <NotAMentorScreen onCreate={() => navigate("/dashboard/mentor/onboarding")} />
            </div>
        );
    }

    if (!mentorProfile?.is_approved) {
        return (
            <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
                <NotVerifiedScreen onBack={() => navigate("/dashboard/overview")} />
            </div>
        );
    }

    const context: MentorDashboardContext = { mentorProfile, userProfile };

    return (
        <div className="min-h-screen w-full text-white" style={{ background: pageBackground }}>
            {/* max-w-4xl to match the Explore page container width */}
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/overview")}
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                >
                    <FiArrowLeft size={15} />
                    Back to Dashboard
                </button>

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-black leading-tight sm:text-4xl">Mentor Dashboard</h1>
                        <VerificationBadge isApproved={!!mentorProfile?.is_approved} />
                    </div>
                </div>

                {/* Tab nav — each item is a real route so pages are deep-linkable
                    and keep their own loading/error state independent of the others. */}
                <div className="mb-10 flex flex-wrap items-center gap-2 sm:gap-3" style={{ borderBottom: cardBorder }}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 border-b-2 pb-3 text-xs font-semibold transition-colors sm:text-sm ${isActive ? "border-[#a6ff00] text-white" : "border-transparent text-white/40 hover:text-white"
                                }`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                {/* Child route renders here with mentorProfile/userProfile available
                    via useOutletContext<MentorDashboardContext>() */}
                <Outlet context={context} />
            </div>
        </div>
    );
};

export default MentorDashboardLayout;