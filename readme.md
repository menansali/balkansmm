# BalkanSMM 🚀

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Production--Ready-success.svg)

**BalkanSMM** is a premium, high-performance Social Media Marketing (SMM) panel built for scalability and user experience. It features a modern implementation of automated order processing, drip-feed delivery logic, and an AI-powered virality predictor.

## ✨ Key Features

### 🏢 For Users
- **AI Virality Tools**: Predict content performance before boosting.
- **Smart Ordering**: Visual service selectors with real-time price calculation.
- **Drip Feed System**: Automated, scheduled delivery of engagement to simulate organic growth.
- **Real-Time Dashboard**: Live order tracking, biological wallet system, and instant support tickets.
- **Responsive Design**: Premium "Glassmorphism" UI optimized for all devices.

### 🔗 Smart Link Analytics *(NEW)*
- **Profile Tracking**: Monitor Instagram, TikTok, YouTube & Twitter profiles.
- **Live Growth Charts**: Real-time follower graphs and engagement metrics.
- **Competitor Comparison**: Compare multiple profiles side-by-side.
- **Best Posting Times**: AI-powered suggestions for optimal content timing.
- **Growth Velocity**: Track followers gained per day.

### 📅 AI Content Scheduler *(NEW)*
- **Calendar View**: Visual content calendar with drag-and-drop scheduling.
- **AI Caption Generator**: Generate viral captions with tone & hashtag options.
- **Multi-Platform Support**: Schedule for Instagram, TikTok, and Twitter.
- **Auto-Boost Integration**: Automatically boost engagement when posts go live.
- **Post Analytics**: Track performance of scheduled content.

### 🏪 Reseller White-Label System *(NEW)*
- **Custom Branding**: Your own logo, colors, and store name.
- **Subdomain Support**: Get your own `yourstore.balkansmm.com` URL.
- **Custom Domain**: Connect your own domain for full white-labeling.
- **Price Markup Control**: Set your own profit margins (default 30%).
- **Customer Management**: Manage your customers, balances, and orders.
- **Revenue Dashboard**: Track profits, orders, and customer activity.

### 🛡️ For Admins
- **Command Center**: Full control over users, orders, and services from a dedicated dashboard.
- **Broadcast System**: Send global announcements (Info, Warning, Alert) to all connected users instantly.
- **Support Desk**: Integrated ticket management system to reply to user inquiries.
- **Service Sync**: Import and sync services from upstream providers (JAP, MTP) automatically.
- **Financial Analytics**: Track revenue, user spending, and profit margins.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Next.js 15 (App Router)
- **Styling**: TailwindCSS v4, Framer Motion (Animations)
- **State**: React Hooks, Context API
- **HTTP**: Axios with Interceptors
- **Icons**: Lucide React

### Backend (Server)
- **Framework**: NestJS (Modular Architecture)
- **Database**: PostgreSQL
- **ORM**: Prisma (Type-safe database access)
- **Authentication**: JWT & Passport (Google OAuth support)
- **Tasks**: NestJS Schedule (Cron jobs for order syncing)
- **Validation**: Class-Validator & Class-Transformer

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js v18+
- PostgreSQL Database
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install

# Copy Environment Variables
cp .env.example .env
# Edit .env and provide your DATABASE_URL and JWT_SECRET

# Run Migrations
npx prisma generate
npx prisma db push

# Seed Admin User (Optional)
node create_admin_user.js

# Start Server
npm run start:dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Development Server
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/balkansmm?schema=public"
JWT_SECRET="your_long_secure_secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
CALLBACK_URL="http://localhost:3001/auth/google/callback"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 📸 Screenshots
*(Add screenshots of Dashboard, Login, and Admin Panel here)*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
**Developed with ❤️ by Menan Sali**
