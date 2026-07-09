import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ element }: { element: React.ReactNode; }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("betamindToken");


  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // const storedUserStr = localStorage.getItem("user");
    // const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    // const isUserOnboarded = user?.onboarded ?? storedUser?.onboarded ?? false;

    // if (requireOnboarding && !isUserOnboarded && location.pathname !== '/onboarding') {
    //   navigate("/onboarding");
    // }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{element}</> : null;
};

export default ProtectedRoute;
