import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Calendar, Filter, X, ChevronDown, Loader2 } from 'lucide-react'
import { eventsApi } from '../services/api'
import { useSocket } from '../context/SocketContext'
import EventCard from '../components/EventCard'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const { socket } = useSocket()

  const locations = [...new Set(events.map(e => e.location.split(',')[0].trim()))]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('eventCreated', (newEvent) => {
        setEvents(prev => [newEvent, ...prev])
      })

      socket.on('eventUpdated', (updatedEvent) => {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))
      })

      socket.on('eventDeleted', ({ id }) => {
        setEvents(prev => prev.filter(e => e.id !== id))
      })

      socket.on('seatUpdate', ({ eventId, availableSeats }) => {
        setEvents(prev => prev.map(e =>
          e.id === eventId ? { ...e, available_seats: availableSeats } : e
        ))
      })

      return () => {
        socket.off('eventCreated')
        socket.off('eventUpdated')
        socket.off('eventDeleted')
        socket.off('seatUpdate')
      }
    }
  }, [socket])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (locationFilter) params.location = locationFilter
      if (dateFilter) params.date = dateFilter

      const response = await eventsApi.getAll(params)
      if (response.success) {
        setEvents(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents()
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, locationFilter, dateFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setLocationFilter('')
    setDateFilter('')
  }

  const hasActiveFilters = searchTerm || locationFilter || dateFilter

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Banner */}
      <section className="relative py-16 mb-8 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-dark to-dark" />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-4"
          >
            Discover <span className="text-gradient">Amazing Events</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Find and book tickets for conferences, workshops, and unforgettable experiences
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Location Filter */}
            <div className="relative lg:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value="" className="bg-dark">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc} className="bg-dark">{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Date Filter */}
            <div className="relative lg:w-48">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
              >
                <X className="w-4 h-4" />
                Clear
              </motion.button>
            )}
          </div>

          {/* Active Filters Tags */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10"
              >
                {searchTerm && (
                  <span className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm flex items-center gap-2">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {locationFilter && (
                  <span className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm flex items-center gap-2">
                    Location: {locationFilter}
                    <button onClick={() => setLocationFilter('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {dateFilter && (
                  <span className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm flex items-center gap-2">
                    Date: {dateFilter}
                    <button onClick={() => setDateFilter('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${events.length} events found`}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-primary rounded-full font-semibold hover:opacity-90 transition-all"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

