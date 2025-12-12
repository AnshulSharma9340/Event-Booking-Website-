import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Ticket } from 'lucide-react'
import { format } from 'date-fns'

export default function EventCard({ event, index = 0 }) {
  const availabilityPercentage = (event.available_seats / event.total_seats) * 100

  const getAvailabilityColor = () => {
    if (availabilityPercentage > 50) return 'bg-accent'
    if (availabilityPercentage > 20) return 'bg-secondary'
    return 'bg-red-500'
  }

  const getAvailabilityText = () => {
    if (availabilityPercentage > 50) return 'Available'
    if (availabilityPercentage > 20) return 'Filling Fast'
    if (availabilityPercentage > 0) return 'Almost Sold Out'
    return 'Sold Out'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group"
    >
      <Link to={`/events/${event.id}`}>
        <div className="glass rounded-2xl overflow-hidden">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />

            {/* Availability Badge */}
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getAvailabilityColor()}`}>
                {getAvailabilityText()}
              </div>
            </div>

            {/* Price */}
            <div className="absolute bottom-4 left-4">
              <span className="text-2xl font-heading font-bold text-gradient">
                ${event.price}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-heading font-bold text-white mb-3 line-clamp-2 group-hover:text-primary-light transition-colors">
              {event.title}
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            {/* Seats Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.available_seats} seats left
                </span>
                <span className="text-gray-500">
                  {event.total_seats - event.available_seats} booked
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${100 - availabilityPercentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${getAvailabilityColor()}`}
                />
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between">
              <span className="text-primary-light font-semibold group-hover:text-white transition-colors">
                View Details
              </span>
              <motion.div
                whileHover={{ x: 5 }}
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors"
              >
                <Ticket className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

