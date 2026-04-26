# Pastel POS System 🛒🍊

A modern, responsive, and mobile-friendly Point of Sale (POS) system built with Next.js, Prisma, and PostgreSQL. It features real-time order tracking, stock management, promotion logic, and a secure admin dashboard.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **pnpm** (or npm/yarn)
- **PostgreSQL** database running locally or remotely

---

## 🚀 Setup Instructions

### 1. Clone & Install Dependencies
First, clone the project and install all the required packages:
```bash
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the project and configure your database connection and admin token:

```env
# Database connection string
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5433/pos_db?schema=public"

# Token used to access the secure admin dashboard
ADMIN_TOKEN="admin123"
```

### 3. Setup the Database
Synchronize your Prisma schema with your PostgreSQL database:

Generate the Prisma Client (required for Next.js to interact with the DB):
```bash
pnpm prisma generate
```

Push the database schema to your PostgreSQL server (this creates the required tables):
```bash
pnpm prisma db push
```

### 4. Start the Development Server
You are ready to go! Start the Next.js development server:
```bash
pnpm dev
```

Open your browser and navigate to `http://localhost:3000`.

---

## 🔒 Accessing the Admin Dashboard

The admin dashboard is protected by a middleware token system. 

To access it for the first time, you must append your `ADMIN_TOKEN` (from your `.env` file) to the URL:
👉 **`http://localhost:3000/admin?token=admin123`**

Once you visit this URL, the system will securely store a cookie in your browser for 7 days. After that, you can simply visit `http://localhost:3000/admin` without needing the token.

---

## 📁 Key Features Overview

- **Customer Flow (`/`)**: Customers enter their nickname and contact info, select items from the menu, and checkout. They can track their order later using their Order ID.
- **Menu & Promotions (`/menu`)**: Dynamic item list with real-time stock limits. Orders over 50฿ trigger a special random free premium item promotion (`/promotion`).
- **Checkout & Payment**: Customers can choose "Pay Now" (uploads a payment slip) or "Pay on Delivery".
- **Admin Dashboard (`/admin`)**: Secure panel to accept orders, verify payment slips, update order statuses, and manage inventory stock. Items subtracted from stock automatically upon checkout.
- **Theming**: Fully responsive, mobile-optimized UI featuring a warm, pastel orange aesthetic. 
