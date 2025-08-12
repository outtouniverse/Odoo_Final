# Travel Planner Frontend

This is the frontend for the Travel Planner application, a comprehensive tool to help users plan their trips, manage itineraries, and discover new destinations and activities.

## ✨ Features

*   **Authentication**: Secure user sign-up and login.
*   **Dashboard**: A personalized dashboard to view and manage your trips.
*   **Trip Management**: Create new trips, view existing ones, and see them on a calendar.
*   **Itinerary Planning**: A modern, bento-style layout to organize your trip details.
*   **Activity & City Search**: Find activities and search for cities to add to your trip.
*   **Budgeting**: Keep track of your trip expenses with a dedicated budget planner.
*   **Public Itineraries**: Share and view trip itineraries.
*   **Admin Panel**: An admin-only section to monitor application KPIs.
*   **Profile Settings**: Manage your account and preferences.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    ```
2.  Navigate to the frontend directory:
    ```sh
    cd frontend
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run the following command:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🛠️ Tech Stack

*   **[React](https://reactjs.org/)**: A JavaScript library for building user interfaces.
*   **[Vite](https://vitejs.dev/)**: A fast frontend build tool.
*   **[TypeScript](https://www.typescriptlang.org/)**: A typed superset of JavaScript.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework.
*   **[Lucide React](https://lucide.dev/)**: A library for simply beautiful icons.

## 📜 Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode.
*   `npm run build`: Builds the app for production.
*   `npm run lint`: Lints the source code using ESLint.
*   `npm run preview`: Serves the production build locally.

## 📁 Project Structure
frontend/
├── public/
│ └── vite.svg
├── src/
│ ├── assets/
│ ├── components/
│ │ ├── admin/
│ │ ├── bento/
│ │ └── ...
│ ├── pages/
│ │ ├── Admin.tsx
│ │ ├── Auth.tsx
│ │ ├── Dashboard.tsx
│ │ └── ...
│ ├── utils/
│ │ ├── api.ts
│ │ └── auth.tsx
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
├── package.json
└── README.md


*   **`public/`**: Contains static assets that are directly served.
*   **`src/`**: Contains the main source code of the application.
    *   **`components/`**: Reusable UI components.
    *   **`pages/`**: Components that represent the application's pages.
    *   **`utils/`**: Utility functions and custom hooks.
    *   **`App.tsx`**: The main application component where routing is handled.
    *   **`main.tsx`**: The entry point of the React application.
