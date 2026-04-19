# ConvoX - The Ultimate MERN Social Ecosystem 💬

![MERN Stack](https://img.shields.io/badge/Stack-MERN-black?style=for-the-badge)
![Socket.io](https://img.shields.io/badge/Real_Time-Socket.io-black?style=for-the-badge)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-black?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Animation-Framer_Motion-black?style=for-the-badge)

ConvoX is a high-performance, monochromatic real-time messaging application engineered for technical users who value speed, privacy, and minimalist design. It transitions away from traditional "glassmorphism" toward a refined, technical aesthetic characterized by absolute blacks, neutral greys, and deep ambient accents.

## 🌟 Core Modules

### 1. Real-Time Messaging Engine
- **Instant Connectivity:** Powered by Socket.io for sub-100ms latency in message delivery.
- **Direct & Group Chats:** Support for private 1-on-1 conversations and dynamically created group environments.
- **Rich Interaction:** Live typing indicators, message status tracking (sent/delivered), and unread count badges.
- **File & Media Support:** Drag-and-drop file sharing with native rendering for images, videos, and documents.

### 2. Social Discovery & Networking
- **Mutual Friend Suggestions:** An intelligent recommendation engine that helps users connect based on shared social circles.
- **Smart Search:** Real-time user discovery across the entire platform.
- **Privacy-First DMs:** Message restriction logic ensuring you only receive direct messages from established connections.
- **Interactive Profiles:** Detailed user profiles featuring customizable avatars, banners, and status updates.

### 3. Integrated Admin & Moderation Suite
- **Automated Safety:** System-monitored message flagging and automated warning counters.
- **The "4-Warning" Rule:** Automated user ban logic triggered after a fourth moderation infraction.
- **Admin Dashboard:** Real-time table for monitoring flagged content, allowing admins to approve or remove messages instantly.
- **Live Notifications:** Moderation actions (warnings/bans) are broadcasted to users in real-time via persistent socket connections.

### 4. Next-Gen UI/UX
- **Ambient Visuals:** A sophisticated "Falling Pattern" background with custom red accents and controllable density.
- **Glassmorphism 2.0:** Ultra-transparent floating panels with heavy `backdrop-blur` for a modern depth feel.
- **Monochromatic Palette:** Strict adherence to absolute black (`oklch(0 0 0)`) and the Zinc theme.
- **Fluid Motion:** Orchestrated animations using Framer Motion for component mounting and navigation transitions.

## 🚀 Technical Architecture

- **Frontend:** React 19, Vite (HMR), Tailwind CSS v4, Lucide Icons.
- **Backend:** Node.js, Express.js architecture.
- **Database:** MongoDB with Mongoose ODM for scalable data modeling.
- **State Management:** React Context API for Global Auth, Sidebar, and Socket state.
- **Real-Time Layer:** Event-driven Socket.io architecture for bi-directional communication.

## 🔧 Installation & Quick Start

1. **Clone & Explore**
   ```bash
   git clone https://github.com/your-username/ConvoX.git
   cd ConvoX
   ```

2. **Backend Configuration**
   ```bash
   cd backend
   npm install
   # Configure your .env with MONGODB_URI and JWT_SECRET
   npm run dev
   ```

3. **Frontend Configuration**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Experience ConvoX**
   Navigate to `http://localhost:5173`. Authentication is required to access the real-time features.
