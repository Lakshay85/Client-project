# FormGuard 🛡️

**FormGuard** is a modern, full-stack form builder and response management platform built with **React + TypeScript** on the frontend and an **Express + TypeScript** API backed by **MySQL**.

## 🌟 Key Features

- **Custom Form Builder**: Easily build custom forms with text fields, textareas, select dropdowns, checkboxes, and radio buttons.
- **Shareable Public Forms**: Publish forms and generate unique shareable links for public data collection.
- **Response Analytics**: View responses overview, submission trends, and detailed response breakdowns.
- **Secure Authentication**: User registration and login powered by JWT authentication and bcrypt password hashing.
- **Relational Storage**: MySQL-backed storage for users, forms, form fields, and submitted responses.

## 🚀 Quick Start

### 1. Install Dependencies
Run the installation command from the root directory:
```bash
npm run install:all
```

### 2. Environment Setup
Copy `server/.env.example` to `server/.env` and update your MySQL connection details and JWT secret:
```env
PORT=4000
JWT_SECRET=your_secret_jwt_key
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=formguard_db
```

### 3. Initialize Database
Create the database and tables:
```bash
npm run db:init --prefix server
```

### 4. Start Development Servers
Run both the API server and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📁 Repository Architecture

```
.
├── client/          # React + Vite + TypeScript frontend application
│   ├── src/         # Form Builder, Public Form, Responses & App Views
│   └── package.json
├── server/          # Express + TypeScript API server
│   ├── src/         # Auth, Forms, Responses, & Database controllers
│   └── package.json
└── package.json     # Concurrently scripts for dev and build
```
