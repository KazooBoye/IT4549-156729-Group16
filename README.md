Bài tập lớn Phát triển phần mềm theo chuẩn ITSS Nhóm 16. Thành viên:

    Nguyễn Mạnh Quân - 20225758 - Nhóm trưởng
    Cao Đức Anh - 20225781
    Đỗ Tuấn Minh - 20225741
    Nguyễn Hải Anh - 20225597
    Trần Cao Bảo Phúc - 20225756


# Gym Management System

This project is a full-stack application for managing a gym, built with React, NodeJS, Express, and PostgreSQL.

## Project Structure

-   `/backend`: Contains the Node.js/Express server-side code and API.
-   `/frontend`: Contains the React client-side application.

## Prerequisites

-   Node.js (v16 or later recommended)
-   npm or yarn
-   PostgreSQL server running

## Setup

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `backend` directory by copying `.env.example` (if provided) or using the structure below. Update it with your PostgreSQL database credentials and other environment variables:
    ```env
    PORT=5000
    DB_USER=your_db_user
    DB_HOST=localhost
    DB_DATABASE=gym_management
    DB_PASSWORD=your_db_password
    DB_PORT=5432
    JWT_SECRET=your_very_secret_jwt_key_here
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```
4.  Set up your PostgreSQL database:
    -   Create a database named `gym_management` (or as specified in your `.env`).
    -   Run the SQL scripts to create tables (these will need to be created based on the models, e.g., in `backend/src/models/User.js` comments).
    Example table creation (execute in psql or a DB tool):
    ```sql
    CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'member', 'staff', 'trainer', 'owner')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE profiles (
        profile_id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        date_of_birth DATE,
        phone_number VARCHAR(20),
        address TEXT,
        occupation VARCHAR(100),
        profile_picture_url VARCHAR(255),
        fingerprint_data TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    -- Add other tables like membership_packages, equipment, etc.
    ```

5.  Start the backend server:
    ```bash
    npm start
    # or for development with nodemon
    npm run dev
    ```
    The backend should be running on `http://localhost:5000` (or your configured `PORT`).

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    # or from root: cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `frontend` directory and add your backend API URL:
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```
4.  Start the frontend development server:
    ```bash
    npm start
    # or
    yarn start
    ```
    The frontend application should be accessible at `http://localhost:3000`.

## Further Development

This is a foundational setup. The following areas need further development:

-   **Backend:**
    -   Implement all controllers and routes for each entity (Users, Members, Staff, Trainers, Rooms, Equipment, Packages, Reports).
    -   Define complete database schemas and migrations.
    -   Implement business logic in services.
    -   Add robust error handling and validation.
    -   Implement `emailService` for password resets and notifications.
    -   Secure all relevant endpoints with `authMiddleware`.
-   **Frontend:**
    -   Build out all components for different user roles and functionalities.
    -   Implement state management more thoroughly (e.g., using `AuthContext` and potentially `useReducer` or Redux/Zustand for complex state).
    -   Create API service modules for interacting with the backend.
    -   Implement `PrivateRoute` component for protected routes.
    -   Style the application using CSS, SASS, or a UI library.
    -   Add forms for all CRUD operations.
    -   Implement reporting and data visualization.

This initial setup provides a solid starting point for building the complete Gym Management System.
