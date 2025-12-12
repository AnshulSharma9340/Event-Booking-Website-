# 🎫 EventFlow - Smart Event Booking System

A full-stack event booking application built with the MERN stack (MySQL, Express, React, Node.js) featuring real-time seat availability updates via Socket.IO.

![EventFlow](https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200)

## ✨ Features-

### User Features

- 🎪 Browse upcoming events with search and filters (location, date)
- 🎫 Book tickets with real-time seat availability
- 📱 Responsive, mobile-friendly design
- 🎨 Beautiful animations with Framer Motion
- 📲 QR code tickets for event entry
- 🎉 Confetti celebration on successful booking

### Admin Features

- 📊 Dashboard with key metrics (events, bookings, revenue)
- ➕ Create, update, and delete events
- 📋 View and manage all bookings
- ⏱️ Real-time updates via WebSocket

### Technical Features

- ⚡ Real-time seat availability updates with Socket.IO
- 🔒 Transaction-safe booking system
- 🎯 Optimized database queries with indexes
- 🌐 RESTful API design

## 🛠️ Tech Stack

### Frontend

- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates
- **React Router** - Navigation
- **Lucide React** - Icons
- **QRCode.react** - QR code generation
- **React Confetti** - Celebration effects

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Socket.IO** - WebSocket server
- **mysql2** - MySQL client with promises

## 📁 Project Structure

```
mern/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context (Socket)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── config/
│   │   └── database.js     # MySQL connection pool
│   ├── routes/
│   │   ├── events.js       # Event CRUD endpoints
│   │   └── bookings.js     # Booking endpoints
│   ├── index.js            # Server entry point
│   └── package.json
│
├── event_booking.sql       # Database schema & seed data
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for MySQL)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mern
```

### 2. Database Setup (Docker)

Start MySQL using Docker Compose:

```bash
# Start MySQL container (runs in background)
docker-compose up -d

# Wait a few seconds for MySQL to initialize
# The database and sample data will be created automatically
```

The MySQL container will:

- Create the `event_booking` database
- Run the `event_booking.sql` script to create tables and seed data
- Expose port 3306

**Database Credentials (Docker):**

- Host: `localhost`
- Port: `3307` (mapped from container's 3306)
- Database: `event_booking`
- User: `eventflow`
- Password: `eventflow123`
- Root Password: `eventflow123`

To check if MySQL is running:

```bash
docker-compose ps
```

To view MySQL logs:

```bash
docker-compose logs mysql
```

To stop MySQL:

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# The .env file should already have Docker credentials
# If not, create it with:
# DB_HOST=localhost
# DB_USER=eventflow
# DB_PASSWORD=eventflow123
# DB_NAME=event_booking

# Start the server
npm start
```

The server will run on `http://localhost:5000`

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### Quick Start (All Commands)

```bash
# Terminal 1: Start MySQL
docker-compose up -d

# Terminal 2: Start Backend
cd server && npm install && npm start

# Terminal 3: Start Frontend
cd client && npm install && npm run dev
```

## 📡 API Endpoints

### Events

| Method | Endpoint          | Description                         |
| ------ | ----------------- | ----------------------------------- |
| GET    | `/api/events`     | Get all events (with search/filter) |
| GET    | `/api/events/:id` | Get single event                    |
| POST   | `/api/events`     | Create event (admin)                |
| PUT    | `/api/events/:id` | Update event (admin)                |
| DELETE | `/api/events/:id` | Delete event (admin)                |

### Bookings

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| GET    | `/api/bookings`            | Get all bookings (admin) |
| GET    | `/api/bookings/code/:code` | Get booking by code      |
| POST   | `/api/bookings`            | Create booking           |
| PUT    | `/api/bookings/:id/cancel` | Cancel booking           |

### Query Parameters (Events)

- `search` - Search in title/description
- `location` - Filter by location
- `date` - Filter by specific date
- `startDate` - Filter from date
- `endDate` - Filter until date

## 🔌 WebSocket Events

### Client → Server

- `joinEvent(eventId)` - Join event room for updates
- `leaveEvent(eventId)` - Leave event room

### Server → Client

- `seatUpdate({ eventId, availableSeats })` - Real-time seat count
- `eventCreated(event)` - New event created
- `eventUpdated(event)` - Event modified
- `eventDeleted({ id })` - Event removed
- `bookingCreated(booking)` - New booking made

## 📱 Pages

1. **Landing Page** (`/`) - Hero, speakers, schedule, pricing, FAQ
2. **Events Page** (`/events`) - Browse all events with filters
3. **Event Details** (`/events/:id`) - Full event info, booking form
4. **Booking Page** (`/booking/:id`) - Checkout flow
5. **Success Page** (`/booking/success/:code`) - Confirmation + QR ticket
6. **Admin Dashboard** (`/admin`) - Event & booking management

## 🎨 Design Features

- **Color Palette**: Purple gradient primary (#8B5CF6), Gold accents (#FFD700)
- **Typography**: Syne (headings), DM Sans (body)
- **Glassmorphism**: Frosted glass card effects
- **Dark Theme**: Elegant dark backgrounds
- **Micro-animations**: Hover effects, transitions, page animations

## 📸 Screenshots

### Landing Page

- Hero section with animated background
- Speaker carousel
- Countdown timer
- Schedule timeline
- Pricing cards

### Events Page

- Search and filter bar
- Animated event cards
- Real-time availability badges

### Booking Flow

- Multi-step checkout
- Form validation
- Processing animation
- Confetti celebration
- Downloadable QR ticket

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for amazing events
