# Clinic Management Application  

## Introduction  
This is a comprehensive setup guide for the Clinic Management application, which leverages a Java Spring Boot backend, a React frontend, and a MySQL database for data storage.

## Prerequisites  
Before you begin, ensure you have the following software installed:  
- **Java 11 or higher**  
- **Node.js (12 or higher)**  
- **MySQL 5.7 or higher**  

## Backend Setup (Java Spring Boot)  
1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/Snuc1925/Clinic-Management.git  
   cd Clinic-Management/backend  
   ```  
2. **Configure MySQL Database**  
   - Create a new MySQL database called `clinic_management`.  
   - Update the `application.properties` file in the `backend/src/main/resources` directory with your database details:  
     
     ```properties  
     spring.datasource.url=jdbc:mysql://localhost:3306/clinic_management  
     spring.datasource.username=<your-username>  
     spring.datasource.password=<your-password>  
     ```  
3. **Run the Application**  
   ```bash  
   ./mvnw spring-boot:run  
   ```  

## Frontend Setup (React)  
1. **Navigate to the frontend directory**:  
   ```bash  
   cd ../frontend  
   ```  
2. **Install Dependencies**  
   ```bash  
   npm install  
   ```  
3. **Run the Frontend Application**  
   ```bash  
   npm start  
   ```  

## Usage  
Visit `http://localhost:3000` to access the clinic management application in your browser.  

## Contributing  
Contributions are welcome! Please submit a pull request or open an issue for any improvements or suggestions.  

## License  
This project is licensed under the MIT License.