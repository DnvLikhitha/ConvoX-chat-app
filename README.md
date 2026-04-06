# Real-Time MERN Chat Workspace 💬

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Real_Time-Socket.io-black?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge)

A robust, real-time messaging application engineered with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. This platform enables users to securely authenticate, connect via direct messages, and collaborate in group chats reliably.

## ✨ Features

- **Real-Time Communication:** Instant direct messaging and group chats powered by Socket.io.
- **Rich Media & File Sharing:** Secure upload and native rendering of images, documents, and videos using Multer.
- **Live User Presence & Typing Indicators:** See instantly who is online and when they are replying.
- **Secure Authentication:** JSON Web Token (JWT) based login, registration, and session management.
- **Dashboard & Analytics:** Keep track of message statistics, active users, and system health.
- **Robust Organization:** Filter chats, manage groups, and search for users seamlessly.

## 🚀 Technology Stack

- **Frontend:** React, Vite, Tailwind CSS v4, React Router DOM.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB & Mongoose.
- **Real-Time Engine:** Socket.io.
- **File Processing:** Multer for multipart/form-data.

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/repo-name.git
   cd repo-name
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with your PORT, MONGODB_URI, and JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Usage**
   Open your browser to `http://localhost:5173`. The backend API will be running on `http://localhost:5000`.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
