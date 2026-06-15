import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import DashNavbar from './component/DashNavbar'
import SideBar from './component/SideBar'
import Content from './content/Content'
import './index.css'
import Login from './pages/Login'
import AuthProvider from './providers/AuthProvider'
import ProtectedRoute from './providers/ProtectedRoute'

const App = () => {
  const YOUR_GOOGLE_CLIENT_ID = "849861043227-982qa4p2jeqj6nja96tv8cdm5h3sm6lg.apps.googleusercontent.com"

  return (
    <>
      <GoogleOAuthProvider clientId={YOUR_GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/login' element={<Login />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute
                    element={
                      <div className="flex min-h-screen bg-[#010C06]">
                        {/* Sidebar */}
                        <SideBar />

                        {/* Main Content Area */}
                        <div className="flex-1 md:ml-44 pt-16 pb-20 md:pb-0">
                          {/* Fixed Navbar */}
                          <DashNavbar />

                          {/* Scrollable Content */}
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
    </>
  )
}

export default App