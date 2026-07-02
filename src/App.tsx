import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashNavbar from "./component/DashNavbar";
import ErrorBoundary from "./component/ErrorBoundary";
import ToastContainer from "./component/ui/Toast";
import Content from "./content/Content";
import "./index.css";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import PasswordResetPage from "./pages/auth/PasswordResetPage";
import SignupPage from "./pages/auth/SignupPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import Onboarding from "./pages/Onboarding";
import MentorDashboard from "./pages/userDashboard/MentorDashboard";
import AuthProvider from "./providers/AuthProvider";
import { GlobalProvider } from "./providers/GlobalContext";
import ProtectedRoute from "./providers/ProtectedRoute";

const App = () => {
  const YOUR_GOOGLE_CLIENT_ID =
    "849861043227-982qa4p2jeqj6nja96tv8cdm5h3sm6lg.apps.googleusercontent.com";

  return (
    <ErrorBoundary>
      <GlobalProvider>
        <GoogleOAuthProvider clientId={YOUR_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <BrowserRouter>
              <ToastContainer />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<PasswordResetPage />} />
                <Route
                  path="/onboarding"
                  element={<ProtectedRoute element={<Onboarding />} requireOnboarding={false} />}
                />
                <Route
                  path="/mentor-dashboard"
                  element={
                    <ProtectedRoute
                      element={
                        <MentorDashboard />
                      }
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <ProtectedRoute
                      element={
                        <div className="min-h-screen bg-black">
                          <div className="pt-16 pb-20 md:pb-0">
                            <DashNavbar />
                            <div className="w-full">
                              <Content />
                            </div>
                          </div>
                        </div>
                      }
                    />
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </GoogleOAuthProvider>
      </GlobalProvider>
    </ErrorBoundary>
  );
};

export default App;
