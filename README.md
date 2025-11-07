# Clinic Management Application

A comprehensive full-stack clinic management system built with Java Spring Boot (backend), ReactJS (frontend), and MySQL database.

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Database Setup](#database-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running in IntelliJ IDEA](#running-in-intellij-idea)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

### Backend (Java Spring Boot)
- ✅ User registration and authentication
- ✅ JWT-based security
- ✅ RESTful API endpoints
- ✅ MySQL database integration
- ✅ User CRUD operations
- ✅ Password encryption with BCrypt

### Frontend (ReactJS)
- ✅ Responsive user interface
- ✅ User login and registration pages
- ✅ Dashboard with user management
- ✅ API integration with backend
- ✅ Modern gradient design

### User Entity Fields
- `id` (Long) - Auto-generated primary key
- `phone` (String) - Unique phone number (used for login)
- `fullName` (String) - User's full name
- `address` (String) - User's address (optional)
- `dateOfBirth` (LocalDate) - User's date of birth (optional)
- `password` (String) - Encrypted password

## Technology Stack

### Backend
- **Framework**: Spring Boot 2.5.6
- **Language**: Java 11
- **Build Tool**: Maven
- **Database**: MySQL 5.7+
- **Security**: Spring Security with JWT
- **ORM**: Hibernate/JPA

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)**: 11 or higher
  ```bash
  java -version
  ```

- **Node.js**: 12 or higher (includes npm)
  ```bash
  node --version
  npm --version
  ```

- **MySQL**: 5.7 or higher
  ```bash
  mysql --version
  ```

- **Maven**: 3.6+ (optional, if not using wrapper)
  ```bash
  mvn --version
  ```

- **IntelliJ IDEA**: 2020.1 or higher (recommended for backend development)

- **Git**: For version control
  ```bash
  git --version
  ```

## Project Structure

```
Clinic-Management/
│
├── backend/                      # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hust/clinic/
│   │   │   │   ├── config/      # Configuration classes
│   │   │   │   ├── controller/  # REST controllers
│   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   ├── entity/      # JPA entities
│   │   │   │   ├── repository/  # JPA repositories
│   │   │   │   ├── security/    # Security configurations
│   │   │   │   ├── service/     # Business logic
│   │   │   │   └── ClinicManagementApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── pom.xml                  # Maven dependencies
│   └── .gitignore
│
├── frontend/                    # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
│
├── database/                   # Database scripts
│   └── schema.sql
│
└── README.md                   # This file
```

## Setup Instructions

### Database Setup

1. **Start MySQL server**

2. **Create the database** (Option 1: Using MySQL CLI)
   ```bash
   mysql -u root -p
   ```
   
   Then run:
   ```sql
   CREATE DATABASE clinic_management;
   ```

3. **Create the database** (Option 2: Using provided SQL script)
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. **Verify database creation**
   ```sql
   USE clinic_management;
   SHOW TABLES;
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Configure database connection**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/clinic_management?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```

3. **Build the application**
   ```bash
   ./mvnw clean install
   ```
   
   Or if you have Maven installed:
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or:
   ```bash
   mvn spring-boot:run
   ```

5. **Verify backend is running**
   
   The backend should start on `http://localhost:8080`
   
   Check the console output for:
   ```
   Started ClinicManagementApplication in X seconds
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Verify frontend is running**
   
   The application should automatically open in your browser at `http://localhost:3000`
   
   If not, manually navigate to `http://localhost:3000`

## Running in IntelliJ IDEA

### Import Project

1. **Open IntelliJ IDEA**

2. **Import the backend project**
   - Click on `File` → `Open`
   - Navigate to the `backend` folder
   - Select the `pom.xml` file
   - Click `Open as Project`

3. **Wait for Maven to download dependencies**
   
   IntelliJ will automatically detect it's a Maven project and download dependencies.

### Configure MySQL

1. Edit `src/main/resources/application.properties` with your MySQL credentials

### Run Configuration

1. **Locate the main class**
   - Navigate to `src/main/java/com/hust/clinic/ClinicManagementApplication.java`

2. **Run the application**
   - Right-click on `ClinicManagementApplication.java`
   - Select `Run 'ClinicManagementApplication.main()'`

3. **Alternative: Create Run Configuration**
   - Click `Run` → `Edit Configurations`
   - Click `+` → `Spring Boot`
   - Name: `ClinicManagementApplication`
   - Main class: `com.hust.clinic.ClinicManagementApplication`
   - Click `OK`
   - Click the green play button to run

### Debug Mode

- Click the debug icon (bug) instead of run icon
- Set breakpoints by clicking on the left margin of code lines

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone": "0123456789",
  "fullName": "John Doe",
  "address": "123 Main St, Hanoi",
  "dateOfBirth": "1990-01-15",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0123456789",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": null,
  "phone": "0123456789",
  "fullName": null
}
```

### User Management Endpoints

**Note:** All user endpoints require JWT token in the Authorization header:
```
Authorization: Bearer {your-jwt-token}
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": 1,
    "phone": "0123456789",
    "fullName": "John Doe",
    "address": "123 Main St, Hanoi",
    "dateOfBirth": "1990-01-15"
  }
]
```

#### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {token}
```

#### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Updated",
  "address": "456 New St, Hanoi",
  "dateOfBirth": "1990-01-15",
  "password": "newpassword123"
}
```

#### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

## Usage

### First Time Setup

1. **Start the backend server** (port 8080)
2. **Start the frontend server** (port 3000)
3. **Navigate to** `http://localhost:3000`

### Register a New User

1. Click on "Register here" link on the login page
2. Fill in the registration form:
   - Phone Number (required, unique)
   - Full Name (required)
   - Address (optional)
   - Date of Birth (optional)
   - Password (required)
   - Confirm Password (required)
3. Click "Register"
4. You'll be redirected to the login page

### Login

1. Enter your phone number and password
2. Click "Login"
3. You'll be redirected to the dashboard

### Dashboard

- View all registered users
- Delete users (admin functionality)
- Logout to return to login page

## Default Credentials

If you ran the `database/schema.sql` script, a default user is created:

- **Phone**: 0123456789
- **Password**: password123

## Troubleshooting

### Backend Issues

**Problem: Port 8080 already in use**
- Solution: Change the port in `application.properties`:
  ```properties
  server.port=8081
  ```

**Problem: MySQL connection refused**
- Solution: Verify MySQL is running and credentials are correct

**Problem: Table doesn't exist**
- Solution: Ensure `spring.jpa.hibernate.ddl-auto=update` is set in `application.properties`

### Frontend Issues

**Problem: Port 3000 already in use**
- Solution: The system will prompt you to use another port (usually 3001)

**Problem: API calls fail (CORS error)**
- Solution: Verify backend is running on port 8080

**Problem: Cannot login**
- Solution: Check browser console for errors and verify backend connectivity

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Developed with ❤️ for Clinic Management**
