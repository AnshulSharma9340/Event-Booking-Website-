const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// GET all events with search and filter
router.get("/", async (req, res) => {
  try {
    const { search, location, date, startDate, endDate } = req.query;

    let query = "SELECT * FROM events WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    if (date) {
      query += " AND DATE(date) = ?";
      params.push(date);
    }

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }

    query += " ORDER BY date ASC";

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

// GET single event by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, error: "Failed to fetch event" });
  }
});

// POST create new event (admin only)
router.post("/", async (req, res) => {
  try {
    const { title, description, location, date, total_seats, price, img } =
      req.body;

    // Validate required fields
    if (!title || !location || !date) {
      return res.status(400).json({
        success: false,
        error: "Title, location, and date are required",
      });
    }

    const seats = total_seats || 100;

    const [result] = await pool.query(
      `INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, location, date, seats, seats, price || 0, img]
    );

    const [newEvent] = await pool.query("SELECT * FROM events WHERE id = ?", [
      result.insertId,
    ]);

    // Emit to all connected clients about new event
    const io = req.app.get("io");
    if (io) {
      io.emit("eventCreated", newEvent[0]);
    }

    res.status(201).json({ success: true, data: newEvent[0] });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, error: "Failed to create event" });
  }
});

// PUT update event (admin only)
router.put("/:id", async (req, res) => {
  try {
    const { title, description, location, date, total_seats, price, img } =
      req.body;
    const eventId = req.params.id;

    // Get current event
    const [currentEvent] = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    if (currentEvent.length === 0) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    // Calculate available seats if total_seats changed
    let available_seats = currentEvent[0].available_seats;
    if (total_seats && total_seats !== currentEvent[0].total_seats) {
      const bookedSeats =
        currentEvent[0].total_seats - currentEvent[0].available_seats;
      available_seats = Math.max(0, total_seats - bookedSeats);
    }

    await pool.query(
      `UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        date = COALESCE(?, date),
        total_seats = COALESCE(?, total_seats),
        available_seats = ?,
        price = COALESCE(?, price),
        img = COALESCE(?, img)
       WHERE id = ?`,
      [
        title,
        description,
        location,
        date,
        total_seats,
        available_seats,
        price,
        img,
        eventId,
      ]
    );

    const [updatedEvent] = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    // Emit to all connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("eventUpdated", updatedEvent[0]);
    }

    res.json({ success: true, data: updatedEvent[0] });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, error: "Failed to update event" });
  }
});

// DELETE event (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const [event] = await pool.query("SELECT * FROM events WHERE id = ?", [
      eventId,
    ]);

    if (event.length === 0) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    await pool.query("DELETE FROM events WHERE id = ?", [eventId]);

    // Emit to all connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("eventDeleted", { id: parseInt(eventId) });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, error: "Failed to delete event" });
  }
});

module.exports = router;
