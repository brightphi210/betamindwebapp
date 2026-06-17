import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGlobalContext } from "./GlobalContext";

const ProtectedRoute = ({ element, requireOnboarding = true }: { element: React.ReactNode; requireOnboarding?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useGlobalContext();
  const isAuthenticated = localStorage.getItem("betamindToken");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Fallback to local storage if user is not in context yet (e.g., hard refresh)
    const storedUserStr = localStorage.getItem("user");
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    const isUserOnboarded = user?.onboarded ?? storedUser?.onboarded ?? false;

    if (requireOnboarding && !isUserOnboarded && location.pathname !== '/onboarding') {
      navigate("/onboarding");
    }
  }, [isAuthenticated, navigate, user, location.pathname, requireOnboarding]);

  return isAuthenticated ? <>{element}</> : null;
};

export default ProtectedRoute;
