-- Create database
CREATE DATABASE IF NOT EXISTS clinic_management;

-- Use database
USE clinic_management;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    date_of_birth DATE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data (password is "password123" hashed with BCrypt)
INSERT INTO users (phone, full_name, address, date_of_birth, password) VALUES
('0123456789', 'John Doe', '123 Main St, Hanoi', '1990-01-15', '$2a$10$E7V7vkZPdLPmS7RvK8vHvuJ4Y1xNx3YH1xM8vKqPq5zL9vTWr2qWC');
