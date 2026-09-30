import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useGetMyUserProfile } from "../../hooks/queries/allQueriess";

export const ONBOARDING_PATH = "/onboarding";

// What counts as a "complete" profile. Adjust to match your backend.
export const isProfileComplete = (profile: any): boolean => {
    if (!profile) return false;
    const hasText = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    return (
        hasText(profile.first_name) &&
        hasText(profile.last_name) &&
        hasText(profile.phone_number) &&
        hasText(profile.city) &&
        hasText(profile.country)
    );
};

const FullScreenLoader = () => (
    <div className="flex min-h-screen w-full items-center justify-center bg-black text-white/50">
        Loading…
    </div>
);

const ProfileCompletionGuard = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const { myProfile, isLoading, isError } = useGetMyUserProfile() as any;

    if (isLoading || (!myProfile && !isError)) return <FullScreenLoader />;

    // Request genuinely failed: don't trap the user in a loop
    if (isError || !myProfile?.data) return <>{children}</>;

    if (!isProfileComplete(myProfile.data) && location.pathname !== ONBOARDING_PATH) {
        return <Navigate to={ONBOARDING_PATH} replace />;
    }

    return <>{children}</>;
};

export default ProfileCompletionGuard;