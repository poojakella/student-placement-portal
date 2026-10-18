# PlaceMate — Student Placement Portal 🎓

A full-stack web application designed to help students explore job opportunities and manage their job applications, while administrators manage job listings through a dedicated dashboard.

## ✨ Features

- 🔐 **Authentication:** Student and admin login and registration.
- 💼 **Job Listings:** Browse available job opportunities.
- 🛠️ **Admin Dashboard:** Add and manage job listings.
- 📝 **Job Applications:** Apply for jobs and view submitted applications.
- 👁️ **Password Visibility:** Show or hide passwords while typing.
- ⏳ **Loading Indicators:** Visual feedback during authentication.
- 🔔 **Toast Notifications:** Display success and error messages.
- 🎨 **Modern UI:** Clean styling, animations, and responsive layouts.

## 🧰 Tech Stack

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

## 📁 Project Structure

```text
student-placement-portal/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database connection
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/poojakella/student-placement-portal.git
   ```

2. Navigate to the project directory:

   ```bash
   cd student-placement-portal
   ```

3. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

4. Install backend dependencies:

   ```bash
   cd ../backend
   npm install
   ```

### Environment Configuration

Create a `backend/.env` file and configure the required environment variables, including your MongoDB connection string and authentication secret.

**Never commit `.env` files or expose database credentials and secrets publicly.**

### Run the Application

Start the backend in one terminal:

```bash
cd backend
node server.js
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL displayed in the frontend terminal.

## 🔄 Application Workflow

1. Students register or log in.
2. Students browse available jobs.
3. Students submit job applications.
4. Students view their applications.
5. Administrators log in to manage job listings.

## 🚀 Future Enhancements

- Job search and filtering.
- Student profile management.
- Resume upload.
- Application status tracking.
- Email notifications.

## 👩‍💻 Author

**Poojitha Kella**

Developed as a full-stack student project to practice frontend development, backend APIs, database integration, and application workflows.
