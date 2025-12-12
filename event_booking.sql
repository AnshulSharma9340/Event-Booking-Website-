-- Smart Event Booking System - Database Schema
-- MySQL Database Script

-- Create database
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 100,
    available_seats INT NOT NULL DEFAULT 100,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    img VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    booking_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Insert sample events
INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES
(
    'Tech Summit 2025',
    'Join us for the largest technology conference of the year. Explore AI, Cloud Computing, and the future of software development with industry leaders.',
    'San Francisco Convention Center, CA',
    '2025-03-15 09:00:00',
    500,
    485,
    299.00,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
),
(
    'Music Festival Nights',
    'Experience three nights of incredible live music featuring top artists from around the world. Food, drinks, and unforgettable memories await.',
    'Central Park, New York City',
    '2025-04-20 18:00:00',
    2000,
    1850,
    150.00,
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800'
),
(
    'Startup Pitch Competition',
    'Watch innovative startups compete for $100K in funding. Network with investors, entrepreneurs, and tech enthusiasts.',
    'Innovation Hub, Austin, TX',
    '2025-02-28 10:00:00',
    200,
    180,
    75.00,
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'
),
(
    'AI & Machine Learning Workshop',
    'Hands-on workshop covering the latest in AI and ML. Build real projects with expert guidance.',
    'Tech Campus, Seattle, WA',
    '2025-03-05 09:00:00',
    100,
    92,
    199.00,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800'
),
(
    'Design Conference 2025',
    'Explore the intersection of creativity and technology. UI/UX trends, design systems, and creative innovation.',
    'Design Center, Los Angeles, CA',
    '2025-04-10 08:30:00',
    350,
    340,
    175.00,
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800'
),
(
    'Blockchain & Web3 Summit',
    'Deep dive into decentralized technologies, cryptocurrency, and the future of digital assets.',
    'Crypto Tower, Miami, FL',
    '2025-05-15 10:00:00',
    300,
    275,
    250.00,
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800'
),
(
    'Cloud Computing Expo',
    'Enterprise cloud solutions, serverless architecture, and DevOps best practices from industry experts.',
    'Cloud Arena, Chicago, IL',
    '2025-03-22 09:00:00',
    400,
    395,
    225.00,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
),
(
    'Cybersecurity Conference',
    'Stay ahead of threats with cutting-edge security strategies and hands-on hacking workshops.',
    'Security Center, Washington DC',
    '2025-04-05 08:00:00',
    250,
    230,
    350.00,
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'
);

-- Create indexes for better performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);

