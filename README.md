<div align="center">

# 📚 BookVault (Haven Books)

<!-- Project Banner Image -->
![BookVault Banner](./bookvault_banner.png)

<div style="margin-top: 15px;">
  
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-FF6B35?style=for-the-badge&logo=npm&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![NodeJS](https://img.shields.io/badge/NodeJS-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![ExpressJS](https://img.shields.io/badge/ExpressJS-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

**Premium Digital Bookstore & Library Management System utilizing a Decoupled Single Page Architecture**

</div>

---

## 🔭 Overview

**BookVault** (also branded as **Haven Books**) is a premium, full-stack digital bookstore and library management system. Built with a decoupled client-server architecture, it links a highly interactive React.js single-page client with a high-performance Node.js & Express.js REST API. Utilizing MongoDB with Mongoose schemas, the application houses a complete relational catalog with real-time shopping cart persistent caching, passwordless OTP register screens, third-party Google OAuth redirection, promo coupon validation campaigns, and secure cryptographically verified Razorpay payment checkouts.

---

## 🚀 Key Features

*   🔑 **Stateless JWT Session Pipeline**: Emulates Laravel Sanctum using secure JSON Web Tokens. Parses `Bearer` authorization headers and verifies roles.
*   🛡️ **Passwordless OTP Email Verification**: Secures sign-up screens by cryptographically generating 6-digit verification codes and dispatching them via SMTP.
*   💳 **Secured Razorpay E-Commerce Checkout**: Features server-side inventory stock checks, discount recalculations, and cryptographic HMAC SHA-256 signature verifications.
*   🎟️ **Promotional Coupon Campaigns**: Validates coupon codes checking active date expiry bounds and usage ceiling locks dynamically.
*   📈 **Interactive Admin Dashboard Panel**: Empowers admins to CRUD books and authors, review statistics, update delivery shippings, and ban/unban users.
*   💡 **Mongoose Virtual ID Adapter**: Resolves MongoDB ObjectIDs into standard SQL `id` string fields, achieving **100% out-of-the-box frontend compatibility**!
*   🍂 **Cozy Literary UI Aesthetics**: Crafted with a premium Tailwind cream-palette aesthetic, smooth Framer Motion transitions, and interactive particle elements.

---

## 🛠️ Technology Stack

| Architecture | Technologies |
|---|---|
| **Frontend SPA** | React.js 18.3, Vite 5.4, Zustand 5.0 (State Engine + LocalStorage Persist) |
| **Backend REST API** | Node.js, Express.js (MVC Pattern), JWT Session guards |
| **Database Storage** | MongoDB, Mongoose (Atomic transactions, text indexes, virtual transforms) |
| **Email Service** | Nodemailer (SMTP dispatch + Server terminal logger fallbacks for offline dev) |
| **Integrations** | Razorpay Web Checkout SDK (Signature HMACS), Google Socialite OAuth 2.0 |

---

## 📂 Project Structure

The codebase is organized as two decoupled folders running independently:

```text
BOOK MANAGEMENT SYSTEM/
│
├── backend/                  # Express.js REST API Engine
│   ├── src/
│   │   ├── config/           # Database setup client (db.js)
│   │   ├── controllers/      # MVC controllers (Auth, Book, Cart, Order, Coupon, OTP, Razorpay)
│   │   ├── middleware/       # JWT Auth protectors, Admin guards, global error catchers
│   │   ├── models/           # Mongoose Database models (User, Book, Author, Cart, Order, Coupon)
│   │   ├── routes/           # API routes (api.js)
│   │   └── utils/            # Nodemailer helpers, dynamic database seeder (seeder.js)
│   ├── uploads/              # Local folder for static cover image uploads
│   ├── server.js             # Entry-point runner
│   └── .env                  # Port variables, database strings, and API secrets
│
├── haven-books/              # React.js Single Page Client
│   ├── src/
│   │   ├── components/       # Reusable layout parts (Navbar, Footer, BookCard)
│   │   ├── lib/              # Axios customized instance setup (api.js)
│   │   ├── pages/            # View pages (Shop, Auth, Admin Panels, User Dashboards)
│   │   ├── stores/           # Zustand persistent state engine (index.js)
│   │   └── index.css         # Custom typography and tailwind colors
│   ├── package.json          # Node dependencies
│   └── .env                  # Frontend environment settings (VITE_API_URL)
│
└── bookvault_banner.png      # 8K High-Resolution repository banner
```

---

## ⚙️ Installation & Running Guide

Ensure you have **Node.js** and **MongoDB** (local community server or Atlas URI) installed on your system.

### 1. Backend REST API Setup
1.  Navigate to the `backend/` folder in your terminal:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  We prepared a ready-to-run `.env` file for you. Open `.env` and verify your `MONGODB_URI` database connection string:
    ```env
    PORT=8000
    MONGODB_URI=mongodb://127.0.0.1:27017/bookvault
    JWT_SECRET=supersecret_jwt_token_auth_secret_key_1234567890_bookvault
    ```
4.  **Seed the Database Catalog**: Populate MongoDB with starter users, 8 default books, 6 authors, and promo coupons:
    ```bash
    npm run seed
    ```
5.  Start the Express server with hot-reloading:
    ```bash
    npm run dev
    ```

### 2. Frontend React Client Setup
1.  Open a new terminal window and navigate to the `haven-books/` directory:
    ```bash
    cd haven-books
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Open the frontend `.env` file and set the base API URL to point to the Express backend port:
    ```env
    VITE_API_URL=http://localhost:8000
    ```
4.  Launch the Vite development server:
    ```bash
    npm run dev
    ```

Open your browser at the Vite URL (typically `http://localhost:8080` or `http://localhost:5173`) to run the complete BookVault application!

---

## ☁️ Vercel Deployment Guide

Deploy your full-stack BookVault application on **Vercel** with this clean, production-ready process:

### 1. Database Preparation
Vercel serverless environments require an active, internet-accessible database.
1. Create a free **MongoDB Atlas** shared cluster.
2. In the MongoDB Atlas dashboard, navigate to **Network Access** and select **Allow Access from Anywhere** (`0.0.0.0/0`) because Vercel serverless IP ranges are dynamic.
3. Copy your database connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/bookvault`).

### 2. Deploying the Backend REST API
1. Connect your GitHub repository to Vercel.
2. Click **Add New Project** and select your repository.
3. Configure the following project parameters:
   * **Project Name**: `bookvault-api`
   * **Framework Preset**: `Other`
   * **Root Directory**: `backend`
4. Expand **Environment Variables** and add the following keys:
   * `MONGODB_URI`: *Your MongoDB Atlas connection string*
   * `JWT_SECRET`: *A secure random string*
   * `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build your Express application using the `@vercel/node` builder and output your live backend URL (e.g., `https://bookvault-api.vercel.app`).

### 3. Deploying the Frontend Client
1. Click **Add New Project** and select your repository again.
2. Configure the following project parameters:
   * **Project Name**: `bookvault-client`
   * **Framework Preset**: `Vite`
   * **Root Directory**: `haven-books`
3. Expand **Environment Variables** and add:
   * `VITE_API_URL`: *Your deployed Vercel backend URL* (e.g., `https://bookvault-api.vercel.app`)
4. Click **Deploy**. Vercel will compile the React build, bundle files, apply rewrite routing rules, and provide your active bookstore URL!

---

## 👥 Default Accounts

*   🔑 **Administrator Role**:
    *   Email: [EMAIL_ADDRESS]`
    *   Password: `1234`
*   👥 **Customer Role**:
    *   Email: [EMAIL_ADDRESS]`
    *   Password: `1234`

---

## 📜 Contributing & License

Contributions are welcome! Please feel free to open pull requests or issues. This repository is open-sourced under the terms of the [MIT License](LICENSE).

---

<div align="center">
  
**Developed with Antigravity by [Aditya Kumar](https://github.com/Aditya-kumar2004)**

</div>
