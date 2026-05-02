# 🐾 PawSmart — Premium Pet Care Platform for Pakistan

> Curated food, expert AI care, and on-call vets — all in one place for pet owners across Pakistan.

![PawSmart](https://img.shields.io/badge/PawSmart-Pakistan-green)
![Cloud Run](https://img.shields.io/badge/Deployed-Google%20Cloud%20Run-blue)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange)

---

## 🌟 About PawSmart

PawSmart is a full-stack AI-powered pet care platform built specifically for Pakistani pet owners. It combines an online pet shop with intelligent AI tools and on-call vet consultations — making premium pet care accessible across Pakistan.

---

## ✨ Features

### 🛍️ Online Pet Shop
- 24+ premium pet products
- Categories: Food & Nutrition, Grooming, Toys, Accessories
- Cash on Delivery across Pakistan
- Free shipping over Rs. 5,000

### 🤖 AI-Powered Tools
- **Breed Detector** — Upload a photo of your pet and instantly identify its breed with tailored care tips
- **Food & Care Recommender** — Get personalized food and daily care plans based on your pet's age, weight, and health
- **Symptom Checker** — Describe symptoms and get possible causes and immediate action steps

### 🩺 Vet Consult
- Direct WhatsApp line to a Pakistan-licensed veterinarian
- Replies within 30 minutes during clinic hours (9am–9pm)
- Private and secure consultations

### 👤 My Pets
- Create profiles for your pets
- Powers personalized AI recommendations

### 🔧 Admin Dashboard
- Live revenue and order tracking
- Product and inventory management
- User management

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Drizzle ORM |
| AI Tools | Rule-based AI with breed & symptom logic |
| Deployment | Google Cloud Run |
| Region | asia-south1 (Mumbai) |

---

## 🌐 Live Demo

👉 **[https://smartpaw-app-486384346038.asia-south1.run.app](https://smartpaw-app-486384346038.asia-south1.run.app)**

---

## 📦 Run Locally

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- PostgreSQL

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/pawsmart" > .env

# Push database schema
pnpm --filter @workspace/db run push

# Seed products
pnpm --filter @workspace/scripts run seed-pawsmart

# Start backend (Terminal 1)
pnpm --filter @workspace/api-server run dev

# Start frontend (Terminal 2)
pnpm --filter @workspace/pawsmart run dev
```

Open → **http://localhost:5173**

---

## 📁 Project Structure

```
Smart-Petshop-main/
├── artifacts/
│   ├── pawsmart/          # React frontend
│   └── api-server/        # Express backend
├── lib/
│   ├── db/                # PostgreSQL schema (Drizzle ORM)
│   └── api-client-react/  # Auto-generated API client
├── scripts/               # Database seed scripts
├── Dockerfile             # Cloud Run deployment
└── pnpm-workspace.yaml    # Monorepo config
```

---

## 🇵🇰 Built for Pakistan

- Prices in Pakistani Rupees (Rs.)
- Cash on Delivery support
- Delivery to Karachi, Lahore, Islamabad
- Vet support tuned for Pakistan's climate and breeds

---

## 👩‍💻 Developer

Built by **Afeefah** as part of the **#AISeekho App Banaao** challenge
powered by Google Cloud AI Credits 🚀

**#VibeKaregaPakistan** 🇵🇰

---

## 📄 License

MIT — feel free to use and build on this project!
