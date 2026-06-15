import { Navigate, Route, Routes } from 'react-router-dom'
import Events from '../pages/mentorDasboard/Events'
import Overview from '../pages/mentorDasboard/Overview'

const Content = () => {
    return (
        <div className='main-content h-[98vh] w-full overflow-y-scroll'>
            <Routes>
                <Route path='/' element={<Navigate to={'/dashboard/overview'} />} />
                <Route path='/dashboard/overview' element={<Overview />} />
                <Route path='/dashboard/events' element={<Events />} />
            </Routes>
        </div>
    )
}

export default Content
