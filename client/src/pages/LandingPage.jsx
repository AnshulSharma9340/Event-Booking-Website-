import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Parallax } from 'react-parallax'
import {
  Ticket, ArrowRight, Calendar, MapPin, Users,
  Star, Clock, ChevronDown, Play, Sparkles
} from 'lucide-react'
import { eventsApi } from '../services/api'
import EventCard from '../components/EventCard'
import CountdownTimer from '../components/CountdownTimer'

export default function LandingPage() {
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll()
        if (response.success) {
          setUpcomingEvents(response.data.slice(0, 4))
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const speakers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'AI Scientist, TechCorp',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
    {
      name: 'Marcus Williams',
      role: 'Head of Cloud Engineering',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Founder & CEO, DevSync',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    },
    {
      name: 'James Park',
      role: 'Lead Security Architect',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    },
  ]

  const schedule = [
    {
      time: '09:00 - 10:00 am',
      title: 'Opening Ceremony',
      description: 'Kick off with a warm welcome and event overview.',
      speakers: [],
    },
    {
      time: '10:30 - 11:50 am',
      title: 'Keynote: The Future of Tech',
      description: 'A visionary talk on AI, innovation, and digital transformation.',
      speakers: ['Dr. Sarah Chen', 'Marcus Williams'],
    },
    {
      time: '12:00 - 12:50 pm',
      title: 'Live Product Showcase',
      description: 'See demos of exciting new products and platforms.',
      speakers: ['Elena Rodriguez'],
    },
    {
      time: '1:20 - 2:30 pm',
      title: 'Networking Lunch',
      description: 'Connect with fellow attendees and industry leaders.',
      speakers: [],
    },
    {
      time: '3:00 - 4:30 pm',
      title: 'Building Scalable Products',
      description: 'Learn strategies for products that grow with your users.',
      speakers: ['James Park', 'Marcus Williams'],
    },
    {
      time: '5:00 - 5:30 pm',
      title: 'Closing Remarks',
      description: 'Wrap up with key takeaways and next steps.',
      speakers: [],
    },
  ]

  const sponsors = [
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
    'https://images.unsplash.com/photo-1611162616305-c69b3037c7bb?w=200',
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200',
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200',
  ]

  const pricingTiers = [
    {
      name: 'Basic',
      price: 99,
      features: [
        'Full event access',
        'Access to keynote sessions',
        'Networking opportunities',
        'Session recordings',
        'Conference swag bag',
      ],
    },
    {
      name: 'Premium',
      price: 399,
      popular: true,
      features: [
        'All Basic features',
        'VIP seating',
        'Exclusive workshops',
        'Speaker meet & greet',
        'Premium lounge access',
        'Priority support',
      ],
    },
  ]

  const faqs = [
    {
      question: 'Will the talks be recorded?',
      answer: 'Yes! All sessions will be recorded and available to ticket holders within 48 hours of the event.',
    },
    {
      question: 'Is this event just for developers?',
      answer: 'Not at all! Our event welcomes designers, product managers, entrepreneurs, and anyone interested in technology.',
    },
    {
      question: 'Can I refund or transfer my ticket?',
      answer: 'Tickets can be refunded up to 7 days before the event. Transfers are allowed at any time.',
    },
    {
      question: 'What does my ticket include?',
      answer: 'Your ticket includes access to all sessions, networking events, meals, and a conference swag bag.',
    },
  ]

  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-dark to-dark-light" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"
          />
          {/* Wavy Pattern */}
          <svg
            className="absolute bottom-0 left-0 right-0"
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="rgba(139, 92, 246, 0.1)"
              d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="px-4 py-1.5 rounded-full glass text-sm text-primary-light flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Discover Amazing Events
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-heading font-bold leading-tight mb-8">
                <span className="text-gradient">Code.</span>
                <span className="text-white"> Connect.</span>
                <br />
                <span className="text-white">Create. </span>
                <span className="text-gradient">One Epic</span>
                <br />
                <span className="text-white">Conference</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                Explore our lineup of incredible events featuring industry leaders
                who will inspire and enlighten at every conference.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/events"
                  className="group flex items-center gap-3 px-8 py-4 bg-white text-dark rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
                >
                  <span>Buy Ticket</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </motion.div>
                </Link>
                <button className="flex items-center gap-3 px-8 py-4 glass rounded-full font-semibold text-lg hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary" />
                  </div>
                  <span>Watch Trailer</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Meet Our <span className="text-gradient">Speakers</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore our lineup of keynote speakers and industry leaders
              who will inspire and enlighten at the conference.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {speakers.map((speaker, index) => (
              <motion.div
                key={speaker.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full aspect-[3/4] object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-heading font-bold text-white">
                      {speaker.name}
                    </h3>
                    <p className="text-primary-light">{speaker.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              <Ticket className="w-5 h-5 text-primary" />
              Buy Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* About / Countdown Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary font-semibold text-lg">About</span>
              <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mt-2 mb-6">
                EventFlow 2025 is an immersive tech conference
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                August 13-15, 2025
              </p>
              <p className="text-gray-400 mb-8">
                Our mission is to bring together the brightest minds in technology,
                fostering innovation and collaboration. Join us for three days of
                inspiring talks, hands-on workshops, and unparalleled networking.
              </p>
              <CountdownTimer targetDate="2025-08-13T09:00:00" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden glass">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
                  alt="Conference"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Upcoming <span className="text-gradient">Events</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Don't miss out on these incredible experiences.
              Book your tickets now before they sell out!
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                  <div className="aspect-video bg-white/10 rounded-xl mb-4" />
                  <div className="h-6 bg-white/10 rounded mb-2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary rounded-full font-semibold text-lg hover:opacity-90 transition-all"
            >
              View All Events
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-24 bg-dark-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Organize Your <span className="text-gradient">Schedule</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Explore our conference timeline and plan your day
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {schedule.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-48 flex-shrink-0">
                    <span className="text-primary font-semibold">{item.time}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{item.description}</p>
                    {item.speakers.length > 0 && (
                      <div className="flex items-center gap-2">
                        {item.speakers.map((speaker) => (
                          <span
                            key={speaker}
                            className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-sm"
                          >
                            {speaker}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-dark rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              <span>Buy Ticket</span>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Pricing for <span className="text-gradient">Tickets</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose the perfect ticket tier for your experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative glass rounded-3xl p-8 ${
                  tier.popular ? 'border-2 border-primary' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-primary rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-heading font-bold text-gradient">
                      ${tier.price}
                    </span>
                    <span className="text-gray-400">/ticket</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300">
                      <Star className="w-5 h-5 text-secondary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/events"
                  className={`block w-full text-center py-4 rounded-full font-semibold transition-all ${
                    tier.popular
                      ? 'bg-white text-dark hover:bg-gray-100'
                      : 'glass hover:bg-white/10'
                  }`}
                >
                  Get Ticket
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-dark-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-semibold text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 45 : 0 }}
                    className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-2xl text-primary">+</span>
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaq === index ? 'auto' : 0,
                    opacity: openFaq === index ? 1 : 0,
                  }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 text-gray-400">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-90" />
        <motion.div
          style={{ y }}
          className="absolute inset-0 opacity-20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200')] bg-cover bg-center" />
        </motion.div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6">
              Ready to Join the Experience?
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Don't miss out on the biggest tech event of the year.
              Secure your spot today and be part of something amazing.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-dark rounded-full font-semibold text-lg hover:bg-gray-100 transition-all"
            >
              <span>Get Your Ticket Now</span>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

