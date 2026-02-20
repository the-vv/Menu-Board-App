# 🍽️ MenuBoard App

A full-stack monorepo application to browse restaurants/cafes, view menu prices, and manage your own places.

**Motivation:** When going to tea shops or cafes with friends, it's easier to calculate GPay splits if you know the exact price of each menu item. Add prices the first time, then use the app to check next time.

---

## 🏗️ Monorepo Structure

```
Menu-Board-App/
├── backend/          # NestJS REST API + MongoDB
└── frontend/         # Ionic Angular 21 mobile app
```

---

## ✨ Features

- 🔍 **Browse & Search** restaurants and cafes (no login required)
- 📍 **Nearby Search** using device GPS
- 🍽️ **View Menus** with prices grouped by category
- ➕ **Add Restaurants** with optional location, tags, and privacy settings
- 💰 **Add Menu Items** with price, category, and availability
- 🔐 **Optional Authentication** — login only required to manage private restaurants
- ⚠️ **Public Data Disclaimer** shown for all user-submitted content
- 🌍 **Public/Private toggle** — share publicly or keep it private

---

## 🚀 Tech Stack

| Layer     | Technology                                    |
|-----------|-----------------------------------------------|
| Frontend  | Ionic 8 + Angular 21 + Capacitor 8            |
| Styling   | Tailwind CSS 4 + PrimeNG 21                   |
| Backend   | NestJS 11                                     |
| Database  | MongoDB (Mongoose ODM)                        |
| Auth      | JWT (Passport.js)                             |

---

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run start:dev
```

API runs at `http://localhost:3000/api`

### Frontend

```bash
cd frontend
npm install
npm run start
```

App runs at `http://localhost:4200`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/profile` | Get current user |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/restaurants` | List public restaurants |
| POST | `/api/restaurants` | Create restaurant |
| GET  | `/api/restaurants/nearby?lat=&lng=` | Nearby restaurants |
| GET  | `/api/restaurants/my` | My restaurants (auth) |
| GET  | `/api/restaurants/:id` | Restaurant details |
| PATCH | `/api/restaurants/:id` | Update (auth, owner) |
| DELETE | `/api/restaurants/:id` | Delete (auth, owner) |

### Menu Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/menu-items/restaurant/:id` | Get menu for restaurant |
| POST | `/api/menu-items` | Add menu item |
| PATCH | `/api/menu-items/:id` | Update item (auth, owner) |
| DELETE | `/api/menu-items/:id` | Delete item (auth, owner) |

---

## 📱 App Pages

- **Home** — Browse all restaurants with type filters and nearby toggle
- **Search** — Search across all public restaurants
- **Restaurant Detail** — View menu items grouped by category with prices
- **Add/Edit Restaurant** — Form with GPS location, type, tags, public toggle
- **Add/Edit Menu Item** — Form with price, currency, category
- **My Restaurants** — Manage your restaurants (requires login)
- **Login / Register** — Optional auth for managing private restaurants

---

## ⚠️ Disclaimer

Menu prices are user-submitted and may differ from actual prices. Always verify with the restaurant.
