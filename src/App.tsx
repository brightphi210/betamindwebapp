import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import DashNavbar from "./component/DashNavbar";
import ErrorBoundary from "./component/ErrorBoundary";
import ToastContainer from "./component/ui/Toast";
import Content from "./content/Content";
import "./index.css";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Onboarding from "./pages/Onboarding";
import EventPublicPage from "./pages/userDashboard/EventPublicPage";
import MentorDashboard from "./pages/userDashboard/MentorDashboard";
import MentorOnboarding from "./pages/userDashboard/MentorOnboarding";
import PublicProfile from "./pages/userDashboard/PublicProfile";
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
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path='profile-public' element={<PublicProfile />} />
                <Route path="/mentor-onboarding" element={<MentorOnboarding />} />
                <Route path="/events/:id" element={<EventPublicPage />} />
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
