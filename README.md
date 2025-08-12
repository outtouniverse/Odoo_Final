# GLOBETROTTER - A Comprehensive Travel Planner

**Team Number**: 185  
**Team Leader**: Tulip Jani  
**P.S - 2**: GLOBETROTTER  
**Final Video Link**: [Link Text](https://drive.google.com/file/d/1MV66XJ1HeRVQEOP5FpyapkVwaYRTKicS/view?usp=sharing)

---

This is a full-stack travel planner application designed to help users organize their trips, discover new destinations, and manage their itineraries seamlessly. The project is built with a React frontend and a Node.js/Express backend.

## ✨ Features

### Frontend
*   **Authentication**: Secure user sign-up and login.
*   **Dashboard**: A personalized dashboard to view and manage your trips.
*   **Trip Management**: Create new trips, view existing ones, and see them on a calendar.
*   **Itinerary Planning**: A modern, bento-style layout to organize your trip details.
*   **Activity & City Search**: Find activities and search for cities to add to your trip.
*   **Budgeting**: Keep track of your trip expenses with a dedicated budget planner.
*   **Public Itineraries**: Share and view trip itineraries.
*   **Admin Panel**: An admin-only section to monitor application KPIs.
*   **Profile Settings**: Manage your account and preferences.

### Backend
*   **User Authentication**: Robust user registration, login, and Google OAuth.
*   **JWT Security**: Access and refresh tokens for secure API communication.
*   **Password Hashing**: Strong password encryption using bcrypt.
*   **Input Validation**: Server-side validation with `express-validator`.
*   **Rate Limiting & CORS**: Enhanced security with rate limiting and CORS policies.
*   **Comprehensive Error Handling**: Centralized error handling middleware.
*   **Database Integration**: MongoDB with Mongoose for data persistence.
*   **User & Profile Management**: APIs for user data and profile updates.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher)
*   [npm](https://www.npmjs.com/)
*   [MongoDB](https://www.mongodb.com/) (local or a cloud instance)
*   [Google OAuth Credentials](https://console.cloud.google.com/)

### Installation & Setup

1.  **Clone the Repository**
    ```sh
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Backend Setup**
    ```sh
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend/` directory and add the following environment variables:
    ```
    MONGODB_URI=your-mongodb-connection-string
    JWT_SECRET=your-super-secret-jwt-key
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    ```
    For Google OAuth, make sure to add `http://localhost:3000/api/auth/google/callback` to your authorized redirect URIs in the Google Cloud Console.

3.  **Frontend Setup**
    ```sh
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend Server**
    From the `backend/` directory:
    ```sh
    npm run dev
    ```
    The backend will be running on `http://localhost:3000`.

2.  **Start the Frontend Development Server**
    From the `frontend/` directory:
    ```sh
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## 🛠️ Tech Stack

### Frontend
*   **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
*   **[Vite](https://vitejs.dev/)**: A fast frontend build tool.
*   **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
*   **[Lucide React](https://lucide.dev/)**: A library for simply beautiful icons.

### Backend
*   **[Node.js](https://nodejs.org/)**: A JavaScript runtime environment.
*   **[Express.js](https://expressjs.com/)**: A web application framework for Node.js.
*   **[MongoDB](https://www.mongodb.com/)**: A NoSQL database.
*   **[Mongoose](https://mongoosejs.com/)**: An ODM library for MongoDB and Node.js.
*   **[JWT (JSON Web Tokens)](https://jwt.io/)**: For securing API endpoints.
*   **[Passport.js](http://www.passportjs.org/)**: For authentication, including Google OAuth 2.0.

## 📁 Project Structure
