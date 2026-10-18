# PlaceMate — Student Placement Portal

A full-stack web application that helps students explore job opportunities and manage their job applications, while administrators can manage job listings through a dedicated dashboard.

## Features

- **User Authentication** — Student and admin login and registration.
- **Job Listings** — Browse available job opportunities.
- **Admin Dashboard** — Add and manage job listings.
- **Job Applications** — Students can apply for jobs and view their applications.
- **Password Visibility** — Show or hide the password while entering it.
- **Loading Indicators** — Visual feedback during login and registration.
- **Toast Notifications** — Feedback for successful actions and errors.
- **Responsive UI** — Designed with a modern, clean interface.

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

## Project Structure

```text
student-placement-portal/
├── backend/
│   └── server.js
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── README.md
└── package.json
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB connection
- Visual Studio Code (recommended)

### Installation

1. Clone or download this repository.
2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Navigate to the backend directory and install its dependencies:

   ```bash
   cd backend
   npm install
   ```

4. Configure your backend environment variables in `backend/.env`. Add the MongoDB connection string and any required authentication secrets. Do not commit `.env` or expose credentials publicly.

### Run the Application

Start the backend in one terminal:

```bash
cd backend
node server.js
```

Start the frontend in another terminal from the project root:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## How It Works

1. Students register or log in.
2. Students browse job listings and submit applications.
3. Students view their submitted applications.
4. Administrators log in to manage job listings.

## Future Enhancements

- Search and filter jobs by role or company.
- Application status tracking.
- Student profile and resume upload.
- Email notifications for application updates.

## Author

Developed as a full-stack student project to demonstrate web development and job application management.

