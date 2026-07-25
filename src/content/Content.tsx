import { Navigate, Route, Routes } from 'react-router-dom'
import MentorBookings from '../pages/mentorDasboard/MentorBooking'
import MentorCreateProduct from '../pages/mentorDasboard/MentorCreateProduct'
import MentorDashboardLayout from '../pages/mentorDasboard/MentorDashboardLayout'
import MentorOverview from '../pages/mentorDasboard/MentorOverview'
import MentorProducts from '../pages/mentorDasboard/MentorProducts'
import MentorProfile from '../pages/mentorDasboard/MentorProfile'
import MentorWallet from '../pages/mentorDasboard/MentorWallet'
import NotFound from '../pages/NotFound'
import EventCreate from '../pages/userDashboard/EventCreate'
import EventPublicPage from '../pages/userDashboard/EventPublicPage'
import Events from '../pages/userDashboard/Events'
import Explore from '../pages/userDashboard/Explore'
import Mentor from '../pages/userDashboard/Mentor'
import MentorOnboardingSuccess from '../pages/userDashboard/Mentoronboardingsuccess'
import Notifications from '../pages/userDashboard/Notifications'
import Overview from '../pages/userDashboard/Overview'
import Product from '../pages/userDashboard/Product'
import SearchPage from '../pages/userDashboard/Search'
import SettingsPage from '../pages/userDashboard/Settings'

const Content = () => {
    return (
        <div className='main-content h-[98vh] w-full overflow-y-scroll'>
            <Routes>
                <Route path='/' element={<Navigate to={'/dashboard/overview'} />} />
                <Route path='/dashboard/overview' element={<Overview />} />
                <Route path='/dashboard/events' element={<Events />} />
                <Route path='/dashboard/explore' element={<Explore />} />
                <Route path="/dashboard/search" element={<SearchPage />} />
                <Route path='/dashboard/setting' element={<SettingsPage />} />
                <Route path='/dashboard/notifications' element={<Notifications />} />
                <Route path='/dashboard/events/create' element={<EventCreate />} />
                <Route path='/dashboard/mentor/success' element={<MentorOnboardingSuccess />} />

                {/* MentorDashboardLayout renders the tab nav + <Outlet />, and each
                    tab below is a nested child route so useOutletContext() works
                    and the layout's default-to-overview redirect can kick in. */}
                <Route path="dashboard/mentor/product/create" element={<MentorCreateProduct />} />
                <Route path="/dashboard/mentor" element={<MentorDashboardLayout />}>
                    <Route path="overview" element={<MentorOverview />} />
                    <Route path="wallet" element={<MentorWallet />} />
                    <Route path="products" element={<MentorProducts />} />
                    <Route path="bookings" element={<MentorBookings />} />
                    <Route path="profile" element={<MentorProfile />} />
                </Route>

                <Route path="/events/:id" element={<EventPublicPage />} />
                <Route path='/dashboard/mentors/:id' element={<Mentor />} />
                <Route path="/dashboard/products/:id" element={<Product />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </div>
    )
}

export default Content