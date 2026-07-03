import { Navigate, Route, Routes } from 'react-router-dom'
import NotFound from '../pages/NotFound'
import EventCreate from '../pages/userDashboard/EventCreate'
import EventPublicPage from '../pages/userDashboard/EventPublicPage'
import Events from '../pages/userDashboard/Events'
import Explore from '../pages/userDashboard/Explore'
import MentorProfile from '../pages/userDashboard/MentorProfile'
import Overview from '../pages/userDashboard/Overview'

const Content = () => {
    return (
        <div className='main-content h-[98vh] w-full overflow-y-scroll'>
            <Routes>
                <Route path='/' element={<Navigate to={'/dashboard/overview'} />} />
                <Route path='/dashboard/overview' element={<Overview />} />
                <Route path="/events/:id" element={<EventPublicPage />} />
                <Route path='/dashboard/events' element={<Events />} />
                <Route path='/dashboard/explore' element={<Explore />} />
                <Route path='/dashboard/mentors/:id' element={<MentorProfile />} />
                <Route path='/dashboard/events/create' element={<EventCreate />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
        </div>
    )
}

export default Content
