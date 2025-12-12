import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { QRCodeSVG } from 'qrcode.react'
import {
  CheckCircle, Calendar, MapPin, Ticket, Download, Share2,
  Mail, Loader2, AlertCircle, ArrowRight, Users
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { bookingsApi } from '../services/api'

export default function BookingSuccessPage() {
  const { code } = useParams()
  const location = useLocation()
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [loading, setLoading] = useState(!location.state?.booking)
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const ticketRef = useRef(null)

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)

    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000)

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(confettiTimer)
    }
  }, [])

  useEffect(() => {
    if (!booking) {
      fetchBooking()
    }
  }, [code])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await bookingsApi.getByCode(code)
      if (response.success) {
        setBooking(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!ticketRef.current) return

    try {
      // Use html2canvas for better download
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0F0A1A',
        scale: 2,
      })
      const link = document.createElement('a')
      link.download = `ticket-${booking.booking_code}.png`
      link.href = canvas.toDataURL()
      link.click()
      toast.success('Ticket downloaded!')
    } catch {
      // Fallback: copy booking code
      navigator.clipboard.writeText(booking.booking_code)
      toast.success('Booking code copied to clipboard!')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Ticket for ${booking.event_title}`,
      text: `I'm attending ${booking.event_title}! Booking code: ${booking.booking_code}`,
      url: window.location.href,
    }

    try {
      await navigator.share(shareData)
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            We couldn't find a booking with this code.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-full font-semibold"
          >
            Browse Events
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#8B5CF6', '#F59E0B', '#10B981', '#FFD700', '#A78BFA']}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"
          >
            <CheckCircle className="w-14 h-14 text-accent" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-3">
            Booking <span className="text-gradient">Confirmed!</span>
          </h1>
          <p className="text-xl text-gray-300">
            Your tickets have been booked successfully
          </p>
        </motion.div>

        {/* Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          ref={ticketRef}
          className="ticket-bg rounded-3xl overflow-hidden mb-8"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-primary p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-80">Event Ticket</p>
                  <p className="font-heading font-bold text-lg">EventFlow</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Booking Code</p>
                <p className="font-heading font-bold text-lg">{booking.booking_code}</p>
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Event Details */}
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-bold text-white mb-4">
                  {booking.event_title}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date & Time</p>
                      <p className="text-white font-semibold">
                        {format(new Date(booking.event_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-gray-300">
                        {format(new Date(booking.event_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="text-white font-semibold">
                        {booking.event_location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Attendee</p>
                      <p className="text-white font-semibold">{booking.name}</p>
                      <p className="text-gray-300">{booking.email}</p>
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Tickets</p>
                    <p className="text-xl font-heading font-bold text-white">
                      {booking.quantity} {booking.quantity === 1 ? 'Ticket' : 'Tickets'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Paid</p>
                    <p className="text-xl font-heading font-bold text-gradient">
                      ${parseFloat(booking.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    code: booking.booking_code,
                    event: booking.event_title,
                    name: booking.name,
                    quantity: booking.quantity,
                  })}
                  size={180}
                  level="H"
                  includeMargin
                />
                <p className="text-dark text-sm mt-2 font-semibold">
                  Scan for entry
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="border-t border-dashed border-white/20 p-4 flex items-center justify-between text-sm text-gray-400">
            <p>Booked on {format(new Date(booking.booking_date), 'MMM d, yyyy • h:mm a')}</p>
            <p>Status: <span className="text-accent font-semibold">{booking.status}</span></p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-primary rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Download className="w-5 h-5" />
            Download Ticket
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-8 py-4 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            <Share2 className="w-5 h-5" />
            Share
          </motion.button>
        </motion.div>

        {/* Email Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 glass rounded-xl flex items-center gap-4 text-center sm:text-left"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <p className="text-gray-300">
            A confirmation email has been sent to <span className="text-white font-semibold">{booking.email}</span> with your ticket details.
          </p>
        </motion.div>

        {/* Browse More Events */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">Looking for more events?</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full font-semibold hover:bg-white/10 transition-all"
          >
            Browse More Events
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

