# Task 3: Authentication System with JWT & Bcrypt

A complete authentication system with secure password hashing, JWT-based protection, and httpOnly cookie token storage.

## Project Structure:

```
Task 3/
├── src/                      # Backend code
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   └── authController.js # Auth logic (signup, login, logout, me)
│   ├── middleware/
│   │   ├── auth.js          # JWT verification middleware
│   │   └── error.middleware.js
│   ├── models/
│   │   └── User.js          # User schema with bcrypt
│   ├── routes/
│   │   └── auth.routes.js   # Auth endpoints
│   ├── utils/
│   │   ├── jwt.js           # JWT generation/verification
│   │   └── logger.js
│   ├── app.js               # Express app
│   └── server.js            # Server entry point
├── frontend/                # React frontend
│   ├── src/
│   │   ├── api/auth.js      # API calls
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── SECURITY.md              # Security documentation
├── package.json
└── .env.example
```

## Features

### Backend
- **Signup**: Create new user accounts with bcrypt password hashing
- **Login**: Authenticate users and issue JWT tokens
- **Protected Routes**: Middleware to verify JWT tokens
- **Token Validation**: Verify tokens from cookies or Authorization headers
- **Error Handling**: Centralized error handling with appropriate HTTP status codes

### Frontend
- **Signup Form**: Register new accounts
- **Login Form**: Authenticate with email/password
- **Protected Routes**: Dashboard only accessible when logged in
- **Session Management**: Automatic token handling via httpOnly cookies
- **User Profile**: View authenticated user information

## API Endpoints

### Public
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login and receive JWT token

### Protected (require valid token)
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout and clear cookie

## Getting Started

### Backend Setup

```bash
# Install dependencies
cd Task\ 3
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

### Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Usage

1. **Signup**: Navigate to `/signup` and create an account
   - Passwords must be at least 6 characters
   - Email must be unique

2. **Login**: Use registered email and password on `/login`
   - Token is automatically stored in httpOnly cookie
   - Session lasts 7 days

3. **Protected Page**: Go to `/dashboard` after login
   - Only accessible when authenticated
   - Redirects to login if not authenticated

4. **Logout**: Click logout button on dashboard
   - Cookie is cleared
   - Session ends

## Security Highlights

### Password Security
- Passwords hashed with **bcrypt** (10 salt rounds)
- Passwords never stored in plain text
- Passwords excluded from API responses

### Token Security
- JWT tokens issued with **7-day expiration**
- Tokens stored in **httpOnly cookies** (not accessible to JavaScript)
- Cookies sent automatically with `withCredentials: true`
- Protected from XSS attacks

### Route Protection
- Middleware verifies token before accessing protected routes
- Invalid/missing tokens return 401 status
- Expired tokens trigger re-login

### Error Handling
- Generic error messages (no user enumeration)
- Proper HTTP status codes
- Centralized error middleware

## Technology Stack

### Backend
- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT generation/verification
- **cors** - Cross-origin requests
- **morgan** - HTTP logging

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

## See Also

- [SECURITY.md](./SECURITY.md) - Detailed security documentation
- [Frontend README](./frontend/README.md) - Frontend-specific setup

## Testing

### Test Signup
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3001/auth/me \
  -b "token=YOUR_JWT_TOKEN"
```

## Notes

- MongoDB must be running on localhost:27017 (or set MONGODB_URI)
- Frontend should run on port 5173
- Backend should run on port 3001
- CORS is configured to allow requests from frontend
- Change `JWT_SECRET` in production to a strong random key
- Set `NODE_ENV=production` in production for secure cookies
