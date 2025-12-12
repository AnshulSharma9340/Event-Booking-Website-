import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Calendar, MapPin, Ticket, User, Mail, Phone,
  CreditCard, Lock, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { eventsApi, bookingsApi } from '../services/api'

export default function BookingPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [event, setEvent] = useState(location.state?.event || null)
  const [quantity, setQuantity] = useState(location.state?.quantity || 1)
  const [loading, setLoading] = useState(!location.state?.event)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!event) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await eventsApi.getById(id)
      if (response.success) {
        setEvent(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch event:', error)
      toast.error('Event not found')
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    setCurrentStep(2)

    try {
      const response = await bookingsApi.create({
        event_id: event.id,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        quantity,
      })

      if (response.success) {
        setCurrentStep(3)
        setTimeout(() => {
          navigate(`/booking/success/${response.data.booking_code}`, {
            state: { booking: response.data }
          })
        }, 1500)
      }
    } catch (error) {
      console.error('Booking failed:', error)
      setCurrentStep(1)
      toast.error(error.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-white mb-2">Event Not Found</h2>
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Event
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Complete Your <span className="text-gradient">Booking</span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { step: 1, label: 'Details' },
            { step: 2, label: 'Processing' },
            { step: 3, label: 'Complete' },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center">
              <motion.div
                animate={{
                  scale: currentStep === item.step ? 1.1 : 1,
                  backgroundColor: currentStep >= item.step ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
              >
                {currentStep > item.step ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  item.step
                )}
              </motion.div>
              <span className={`ml-2 hidden sm:block ${
                currentStep >= item.step ? 'text-white' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              {index < 2 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                  currentStep > item.step ? 'bg-primary' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8"
            >
              {currentStep === 1 && (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-heading font-bold text-white mb-6">
                    Your Information
                  </h2>

                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                            errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                            errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-gray-400 mb-2">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                          className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
                            errors.mobile ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      {errors.mobile && (
                        <p className="text-red-400 text-sm mt-1">{errors.mobile}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    className="w-full mt-8 py-4 bg-gradient-primary rounded-xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Confirm Booking
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-gray-500 text-sm mt-4">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Your information is secure and encrypted
                  </p>
                </form>
              )}

              {currentStep === 2 && (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-6"
                  >
                    <Loader2 className="w-16 h-16 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-heading font-bold text-white mb-2">
                    Processing Your Booking
                  </h2>
                  <p className="text-gray-400">
                    Please wait while we confirm your reservation...
                  </p>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"
                  >
                    <CheckCircle className="w-12 h-12 text-accent" />
                  </motion.div>
                  <h2 className="text-2xl font-heading font-bold text-white mb-2">
                    Booking Confirmed!
                  </h2>
                  <p className="text-gray-400">
                    Redirecting to your ticket...
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 sticky top-24"
            >
              <h2 className="text-xl font-heading font-bold text-white mb-6">
                Order Summary
              </h2>

              {/* Event Info */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-white/10">
                <img
                  src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'}
                  alt={event.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(event.date), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4 text-primary" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Ticket className="w-4 h-4 text-primary" />
                  {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Ticket Price</span>
                  <span>${event.price} × {quantity}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Service Fee</span>
                  <span>$0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-heading font-bold text-gradient">
                  ${(event.price * quantity).toFixed(2)}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

