# ☕ Brewluxe — Artisan Café Ordering & Management System

> **IT005 Project** — A full-stack, mobile-first café ordering and operations management platform built with **Angular 22**, **Ionic Framework 9**, and **Supabase (PostgreSQL & Realtime)**.

[![Framework](https://img.shields.io/badge/Angular-22.0.1-DD0031.svg?logo=angular)](https://angular.io/)
[![Ionic](https://img.shields.io/badge/Ionic-9.0.0-3880FF.svg?logo=ionic)](https://ionicframework.com/)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Realtime-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-000000.svg?logo=vercel)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-28%2F28%20Passing-brightgreen.svg)]()

---

## 👥 Development Team

| Team Member | Project Role | Contribution |
|---|---|---|
| **Steven S. Lavilla** | Team Leader / Developer | Project coordination, core development, system quality & integration |
| **Arc Danier C. Gayon** | Developer | UI/UX implementation, interface styling, front-end architecture |
| **Matthew Rovic V. Balita** | Developer | Feature engineering, visual design, user flow implementation |
| **Junjifil Castro P. Jr** | Developer | Interactive functionality, product customization, cart & checkout flow |
| **Mohamed Radwan T. Ali** | Developer | Technical backend integration, Supabase schemas, environment configuration |

---

## ✨ Features & Capabilities

### ☕ 1. 94-Item Artisan Product Catalog
- **Coffee (19 Items):** Espresso, Flat White, Dirty Matcha, Caffe Latte, Caramel Macchiato, and more.
- **Iced Coffee (14 Items):** Iced Americano, Cold Brew, Iced Spanish Latte, Iced Vanilla Latte, etc.
- **Frappes (18 Items):** Coffee Frappe, Java Chip, Matcha Frappe, Oreo Frappe, Taro Frappe, etc.
- **Pastries (15 Items):** Croissants, Danishes, Muffins, Eclairs, Tarts — baked fresh daily.
- **Shakes (10 Items):** Chocolate, Strawberry, Mango, Ube, Oreo, Caramel, Banana Shakes, etc.
- **Non-Coffee (18 Items):** Hot & Iced Chocolate, Matcha, Fruit Teas, Fresh Milk infusions.
- High-efficiency **WebP** image assets for fast mobile loading.

### 🥐 2. Streamlined Ordering Flow
- **Drink Customizer:** Cup size (Standard, Tall, Grande), sweetness levels (0%, 25%, 50%, 75%, 100%), ice levels, and specialty add-ons.
- **Pastry Fast-Add:** Pastries feature simplified 1-tap ordering with standard portioning and no unnecessary drink customization options.
- **Interactive Cart:** Real-time quantity adjustment, customizable order items, and item notes.

### 🛡️ 3. Multi-Tier Role-Based Workflows
- **Customer:** Menu browsing, beverage customization, order tracking, order history, profile management.
- **Employee / Staff:** Real-time kitchen display system (KDS), order status transitions (Pending ➔ Preparing ➔ Ready ➔ Completed), barcode/receipt lookup.
- **Admin:** Inventory tracking, catalog adjustments, order volume metrics, daily sales reports.
- **Super Admin:** System-wide audit logs, role assignments, staff account management.

### ⚡ 4. Realtime Database & Supabase Cloud
- **Live Orders Channel:** Realtime PostgreSQL WebSocket sync ensures kitchen staff see orders the instant a customer checks out.
- **Row-Level Security (RLS):** Role-based authorization policies protecting customer data and staff interfaces.

---

## 🛠️ Technology Stack

- **Frontend:** Angular 22.0.1 (Standalone Components), Ionic Framework 9.0.0
- **State & Reactivity:** RxJS 7.8
- **Styles:** SCSS, Ionic Theme Engine, CSS Variables
- **Backend / Database:** Supabase (PostgreSQL 15+, Supabase Auth, Supabase Realtime)
- **Email Receipts:** Resend API integration
- **Testing:** Vitest & Karma (28 automated unit tests passing)
- **Deployment:** Vercel with automatic CI/CD builds

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.x, v20.x, or v24.x
- **npm:** v9.x or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Arjay350/Brewluxe.git
cd Brewluxe

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example to .env and fill in your Supabase credentials:
cp .env.example .env
```

### Local Development

```bash
# Start the local development server (runs on port 4200)
npm start
```

### Running Tests

```bash
# Run unit test suite
npm test
```

### Building for Production

```bash
# Compiles production assets into www/
npm run build
```

---

## 🌐 Deployment on Vercel

1. Import this repository into **[Vercel](https://vercel.com)** under your team workspace.
2. Configure the following **Environment Variables** in project settings:
   - `SUPABASE_URL`: Your Supabase Project URL (`https://<project-ref>.supabase.co`)
   - `SUPABASE_PUBLISHABLE_KEY`: Your Supabase public anon key
   - `RESEND_API_KEY`: *(Optional)* Your Resend API token for order confirmation emails
3. Deploy! Vercel automatically runs `npm run build` using the configured `scripts/set-env.cjs` pipeline.

---

## 📄 License
This project was developed for educational purposes as part of the **IT005** coursework. All rights reserved by the Brewluxe Project Team.
