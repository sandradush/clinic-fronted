-- Database Schema for Video Calling System
-- Run these SQL commands to create the required tables

-- 1. Video calls table
CREATE TABLE IF NOT EXISTS video_calls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  doctor_id INT NOT NULL,
  patient_id INT NOT NULL,
  channel_name VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('scheduled', 'active', 'ended', 'cancelled') DEFAULT 'scheduled',
  started_at TIMESTAMP NULL,
  ended_at TIMESTAMP NULL,
  duration INT DEFAULT 0, -- in seconds
  ended_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ended_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_appointment_id (appointment_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- 2. Video call participants table
CREATE TABLE IF NOT EXISTS video_call_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  call_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('doctor', 'patient', 'admin') NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP NULL,
  FOREIGN KEY (call_id) REFERENCES video_calls(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (call_id, user_id),
  INDEX idx_call_id (call_id),
  INDEX idx_user_id (user_id)
);

-- 3. Appointment notes table (for call notes)
CREATE TABLE IF NOT EXISTS appointment_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  notes TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_appointment_notes (appointment_id),
  INDEX idx_appointment_id (appointment_id)
);

-- 4. Add mobile_token column to users table for push notifications
ALTER TABLE users ADD COLUMN mobile_token VARCHAR(255) NULL AFTER phone;
ALTER TABLE users ADD COLUMN device_type ENUM('web', 'android', 'ios') DEFAULT 'web' AFTER mobile_token;
ALTER TABLE users ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER device_type;