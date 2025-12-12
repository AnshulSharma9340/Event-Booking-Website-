const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const eventsRoutes = require("./routes/events");
const bookingsRoutes = require("./routes/bookings");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make io accessible in routes
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/events", eventsRoutes);
app.use("/api/bookings", bookingsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Join event room for real-time seat updates
  socket.on("joinEvent", (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`Client ${socket.id} joined event-${eventId}`);
  });

  socket.on("leaveEvent", (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`Client ${socket.id} left event-${eventId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});
