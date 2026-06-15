import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ element }: any) => {
  const navigate = useNavigate();
  // const isAuthenticated = localStorage.getItem("betamindToken");
  const isAuthenticated = 'aabbcc'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? element : null;
};

export default ProtectedRoute;
