import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar, MapPin, Users, Ticket, ArrowLeft, Share2, Heart,
  Clock, DollarSign, Minus, Plus, Loader2, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { eventsApi } from '../services/api'
import { useSocket } from '../context/SocketContext'

export default function EventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const { socket } = useSocket()

  useEffect(() => {
    fetchEvent()
  }, [id])

  useEffect(() => {
    if (socket && event) {
      socket.emit('joinEvent', event.id)

      socket.on('seatUpdate', ({ eventId, availableSeats }) => {
        if (eventId === event.id) {
          setEvent(prev => ({ ...prev, available_seats: availableSeats }))
        }
      })

      return () => {
        socket.emit('leaveEvent', event.id)
        socket.off('seatUpdate')
      }
    }
  }, [socket, event?.id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getById(id)
      if (response.success) {
        setEvent(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch event:', error)
      setError('Event not found')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= Math.min(10, event.available_seats)) {
      setQuantity(newQuantity)
    }
  }

  const handleBookNow = () => {
    if (event.available_seats < quantity) {
      toast.error('Not enough seats available')
      return
    }
    navigate(`/booking/${event.id}`, { state: { quantity, event } })
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const availabilityPercentage = event ? (event.available_seats / event.total_seats) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-6">The event you're looking for doesn't exist.</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-full font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Image */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-8 left-4 sm:left-8">
          <Link
            to="/events"
            className="flex items-center gap-2 px-4 py-2 glass rounded-full hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-8 right-4 sm:right-8 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`w-12 h-12 rounded-full glass flex items-center justify-center transition-all ${
              isLiked ? 'bg-red-500/30 text-red-500' : 'hover:bg-white/20'
            }`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-12 h-12 rounded-full glass flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8"
            >
              {/* Availability Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  availabilityPercentage > 50 ? 'bg-accent/20 text-accent' :
                  availabilityPercentage > 20 ? 'bg-secondary/20 text-secondary' :
                  availabilityPercentage > 0 ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {availabilityPercentage > 50 ? 'Available' :
                   availabilityPercentage > 20 ? 'Filling Fast' :
                   availabilityPercentage > 0 ? 'Almost Sold Out' : 'Sold Out'}
                </span>
                <span className="text-sm text-gray-400">
                  {event.available_seats} of {event.total_seats} seats left
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
                {event.title}
              </h1>

              {/* Event Details */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Date & Time</p>
                    <p className="text-white font-semibold">
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-gray-300">
                      {format(new Date(event.date), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white font-semibold">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">
                  About This Event
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {event.description || 'Join us for an unforgettable experience at this amazing event. Connect with like-minded individuals, learn from industry experts, and create memories that will last a lifetime.'}
                </p>
              </div>

              {/* Map Placeholder */}
              <div className="mb-8">
                <h2 className="text-xl font-heading font-bold text-white mb-4">
                  Event Location
                </h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-white/5 relative">
                  <iframe
                    title="Event Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(event.location)}`}
                  />
                </div>
              </div>

              {/* Real-time Availability */}
              <div>
                <h2 className="text-xl font-heading font-bold text-white mb-4">
                  Seat Availability
                </h2>
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {event.available_seats} seats available
                    </span>
                    <span className="text-gray-500">
                      {event.total_seats - event.available_seats} booked
                    </span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - availabilityPercentage}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        availabilityPercentage > 50 ? 'bg-accent' :
                        availabilityPercentage > 20 ? 'bg-secondary' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    Real-time updates enabled
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-1">Price per ticket</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-heading font-bold text-gradient">
                    ${event.price}
                  </span>
                  <span className="text-gray-400">/ticket</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-gray-400 mb-2">Number of Tickets</label>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                  <span className="text-2xl font-heading font-bold text-white">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(10, event.available_seats)}
                    className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Max 10 tickets per order</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4 border-t border-white/10 mb-6">
                <span className="text-gray-400">Total</span>
                <span className="text-2xl font-heading font-bold text-white">
                  ${(event.price * quantity).toFixed(2)}
                </span>
              </div>

              {/* Book Now Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                disabled={event.available_seats === 0}
                className="w-full py-4 bg-gradient-primary rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                <Ticket className="w-5 h-5" />
                {event.available_seats === 0 ? 'Sold Out' : 'Book Now'}
              </motion.button>

              {/* Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-primary" />
                  Instant confirmation
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Free cancellation up to 24h
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Ticket className="w-4 h-4 text-primary" />
                  Mobile ticket
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

