#  Appointment Booking Platform

## Introduction
The Virtual Hackathon Booking Platform is a full-stack web application designed to allow users to seamlessly register and manage their participation in virtual hackathons.

## Features
- **User Authentication & Authorization**: Secure login and registration using JWT.
- **Event Management**: View available hackathons and register for events.
- **File Uploads**: Support for uploading related files or projects.
- **Responsive Design**: Mobile-friendly frontend built with Bootstrap.

## Technology Stack

**Frontend:**
- React 18 (built with Vite)
- React Router DOM for routing
- Bootstrap for styling
- Axios for API requests
- React Toastify for notifications

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose for data storage
- JSON Web Token (JWT) & bcryptjs for secure authentication
- Multer for handling file uploads
- Google APIs integration

## Project Structure
```text
hackathon-booking/
├── backend/            # Node.js + Express backend server
└── frontend/           # React frontend application
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance (local or Atlas)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `backend` directory.
   - You can refer to `.env.example` if available, or configure your database, secret keys, etc.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will run using `nodemon`.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `frontend` directory (e.g., for API endpoints).
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Backend (`/backend`)
- `npm start`: Starts the server (`node server.js`).
- `npm run dev`: Starts the server in development mode using nodemon.
- `npm test`: Runs backend tests using Jest.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.
