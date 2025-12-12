import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import EventsPage from './pages/EventsPage'
import EventDetailsPage from './pages/EventDetailsPage'
import BookingPage from './pages/BookingPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailsPage />} />
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="booking/success/:code" element={<BookingSuccessPage />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </SocketProvider>
  )
}

export default App
