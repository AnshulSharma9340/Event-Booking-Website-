import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  DollarSign,
  Edit2,
  Loader2,
  Plus,
  Search,
  Ticket,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSocket } from "../context/SocketContext";
import { bookingsApi, eventsApi } from "../services/api";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { socket, isConnected } = useSocket();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    total_seats: 100,
    price: 0,
    img: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("eventCreated", (newEvent) => {
        setEvents((prev) => [newEvent, ...prev]);
      });

      socket.on("eventUpdated", (updatedEvent) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        );
      });

      socket.on("eventDeleted", ({ id }) => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      });

      socket.on("bookingCreated", (newBooking) => {
        setBookings((prev) => [newBooking, ...prev]);
      });

      socket.on("seatUpdate", ({ eventId, availableSeats }) => {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, available_seats: availableSeats } : e
          )
        );
      });

      return () => {
        socket.off("eventCreated");
        socket.off("eventUpdated");
        socket.off("eventDeleted");
        socket.off("bookingCreated");
        socket.off("seatUpdate");
      };
    }
  }, [socket]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, bookingsRes] = await Promise.all([
        eventsApi.getAll(),
        bookingsApi.getAll(),
      ]);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      date: "",
      total_seats: 100,
      price: 0,
      img: "",
    });
    setEditingEvent(null);
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || "",
        location: event.location,
        date: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
        total_seats: event.total_seats,
        price: event.price,
        img: event.img || "",
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.location || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingEvent) {
        const response = await eventsApi.update(editingEvent.id, formData);
        if (response.success) {
          toast.success("Event updated successfully");
          handleCloseModal();
        }
      } else {
        const response = await eventsApi.create(formData);
        if (response.success) {
          toast.success("Event created successfully");
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error("Failed to save event");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await eventsApi.delete(id);
      if (response.success) {
        toast.success("Event deleted successfully");
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const response = await bookingsApi.cancel(id);
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
        toast.success("Booking cancelled successfully");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalEvents: events.length,
    totalBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalRevenue: bookings
      .filter((b) => b.status === "confirmed")
      .reduce((sum, b) => sum + parseFloat(b.total_amount), 0),
    totalSeats: events.reduce((sum, e) => sum + e.total_seats, 0),
    bookedSeats: events.reduce(
      (sum, e) => sum + (e.total_seats - e.available_seats),
      0
    ),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              Manage your events and bookings
              {isConnected && (
                <span className="flex items-center gap-1 text-accent text-sm">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  Real-time
                </span>
              )}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-gray-400">Events</span>
            </div>
            <p className="text-3xl font-heading font-bold text-white">
              {stats.totalEvents}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-accent" />
              </div>
              <span className="text-gray-400">Bookings</span>
            </div>
            <p className="text-3xl font-heading font-bold text-white">
              {stats.totalBookings}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-gray-400">Revenue</span>
            </div>
            <p className="text-3xl font-heading font-bold text-gradient">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="text-gray-400">Seats Sold</span>
            </div>
            <p className="text-3xl font-heading font-bold text-white">
              {stats.bookedSeats}
              <span className="text-lg text-gray-500">/{stats.totalSeats}</span>
            </p>
          </motion.div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                activeTab === "events"
                  ? "bg-gradient-primary text-white"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                activeTab === "bookings"
                  ? "bg-gradient-primary text-white"
                  : "glass text-gray-400 hover:text-white"
              }`}
            >
              Bookings ({bookings.length})
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all w-full sm:w-64"
            />
          </div>
        </div>

        {/* Events Table */}
        {activeTab === "events" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Event
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Date
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Location
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Seats
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Price
                    </th>
                    <th className="text-right p-4 text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              event.img ||
                              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100"
                            }
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold text-white">
                              {event.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {event.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white">
                          {format(new Date(event.date), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), "h:mm a")}
                        </p>
                      </td>
                      <td className="p-4 text-gray-300">
                        {event.location.split(",")[0]}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white">
                            {event.available_seats}
                          </span>
                          <span className="text-gray-500">
                            / {event.total_seats}
                          </span>
                        </div>
                        <div className="w-20 h-1.5 bg-white/10 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full ${
                              event.available_seats / event.total_seats > 0.5
                                ? "bg-accent"
                                : event.available_seats / event.total_seats >
                                  0.2
                                ? "bg-secondary"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${
                                (1 -
                                  event.available_seats / event.total_seats) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="p-4 text-gradient font-semibold">
                        ${event.price}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenModal(event)}
                            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm(event)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No events found
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bookings Table */}
        {activeTab === "bookings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Booking
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Event
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Customer
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Tickets
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Amount
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="text-right p-4 text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-mono text-primary-light">
                          {booking.booking_code}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(
                            new Date(booking.booking_date),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </td>
                      <td className="p-4 text-white">{booking.event_title}</td>
                      <td className="p-4">
                        <p className="text-white">{booking.name}</p>
                        <p className="text-sm text-gray-500">{booking.email}</p>
                      </td>
                      <td className="p-4 text-white">{booking.quantity}</td>
                      <td className="p-4 text-gradient font-semibold">
                        ${parseFloat(booking.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === "confirmed"
                              ? "bg-accent/20 text-accent"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "confirmed" && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCancelBooking(booking.id)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Cancel Booking"
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBookings.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No bookings found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-white">
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Event title"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Event description"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, State"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">
                      Date & Time <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-2">
                      Total Seats
                    </label>
                    <input
                      type="number"
                      name="total_seats"
                      value={formData.total_seats}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-2">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">Image URL</label>
                  <input
                    type="url"
                    name="img"
                    value={formData.img}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-all"
                  />
                  {formData.img && (
                    <img
                      src={formData.img}
                      alt="Preview"
                      className="mt-2 w-full h-32 object-cover rounded-xl"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-primary rounded-xl font-semibold hover:opacity-90 transition-all"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-dark rounded-3xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Delete Event?
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{deleteConfirm.title}"? This
                action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 glass rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-3 bg-red-500 rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
