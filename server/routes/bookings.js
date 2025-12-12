const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Generate unique booking code
const generateBookingCode = () => {
  return `EVT-${uuidv4().split('-')[0].toUpperCase()}`;
};

// GET all bookings (admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      ORDER BY b.booking_date DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// GET booking by code
router.get('/code/:code', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location, e.img as event_img
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.booking_code = ?
    `, [req.params.code]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});

// GET bookings by event
router.get('/event/:eventId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM bookings
      WHERE event_id = ? AND status = 'confirmed'
      ORDER BY booking_date DESC
    `, [req.params.eventId]);

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// POST create booking
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { event_id, name, email, mobile, quantity } = req.body;

    // Validate required fields
    if (!event_id || !name || !email || !mobile || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check event exists and has available seats
    const [event] = await connection.query(
      'SELECT * FROM events WHERE id = ? FOR UPDATE',
      [event_id]
    );

    if (event.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event[0].available_seats < quantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: `Only ${event[0].available_seats} seats available`
      });
    }

    const total_amount = event[0].price * quantity;
    const booking_code = generateBookingCode();

    // Create booking
    const [result] = await connection.query(
      `INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount, booking_code)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_id, name, email, mobile, quantity, total_amount, booking_code]
    );

    // Update available seats
    await connection.query(
      'UPDATE events SET available_seats = available_seats - ? WHERE id = ?',
      [quantity, event_id]
    );

    await connection.commit();

    // Get the complete booking with event details
    const [newBooking] = await pool.query(`
      SELECT b.*, e.title as event_title, e.date as event_date, e.location as event_location, e.img as event_img
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.id = ?
    `, [result.insertId]);

    // Get updated event for real-time update
    const [updatedEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [event_id]);

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('seatUpdate', {
        eventId: event_id,
        availableSeats: updatedEvent[0].available_seats
      });
      io.emit('bookingCreated', newBooking[0]);
    }

    res.status(201).json({ success: true, data: newBooking[0] });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  } finally {
    connection.release();
  }
});

// PUT cancel booking
router.put('/:id/cancel', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingId = req.params.id;

    // Get booking
    const [booking] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [bookingId]
    );

    if (booking.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking[0].status === 'cancelled') {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Booking already cancelled' });
    }

    // Cancel booking
    await connection.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', bookingId]
    );

    // Restore seats
    await connection.query(
      'UPDATE events SET available_seats = available_seats + ? WHERE id = ?',
      [booking[0].quantity, booking[0].event_id]
    );

    await connection.commit();

    // Get updated event
    const [updatedEvent] = await pool.query('SELECT * FROM events WHERE id = ?', [booking[0].event_id]);

    // Emit real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('seatUpdate', {
        eventId: booking[0].event_id,
        availableSeats: updatedEvent[0].available_seats
      });
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel booking' });
  } finally {
    connection.release();
  }
});

module.exports = router;

