# Task 3 Implementation Guide

## Overview

This task implements a complete authentication system with:
- **Backend**: Node.js/Express API with JWT tokens and bcrypt password hashing
- **Frontend**: React application with login/signup forms and protected routes
- **Security**: HttpOnly cookies, CORS with credentials, and proper error handling

## Quick Start

### 1. Backend Setup (Terminal 1)

```bash
cd Task\ 3
npm install
cp .env.example .env
# Edit .env if needed (default uses localhost MongoDB)
npm run dev
```

**Expected output:**
```
Server running on port 3001
MongoDB connected: localhost
```

### 2. Frontend Setup (Terminal 2)

```bash
cd Task\ 3/frontend
npm install
npm run dev
```

**Expected output:**
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 3. Test the System

Open browser to `http://localhost:5173`

- **Signup**: Click "Sign Up" → Create account → Redirects to dashboard
- **Login**: Click "Login" → Enter credentials → Redirects to dashboard
- **Protected Route**: Access `/dashboard` (redirects to login if not authenticated)
- **Logout**: Click logout button → Returns to home

## API Documentation

### Authentication Endpoints

#### POST `/auth/signup`
- **Request**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "userid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGc..."
  }
  ```
- **Errors**: 400 (missing fields, email exists), 500 (server error)

#### POST `/auth/login`
- **Request**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response** (200): Same as signup
- **Errors**: 400 (missing fields), 401 (invalid credentials)

#### GET `/auth/me` *(Protected)*
- **Headers**: Token in httpOnly cookie (auto-sent)
- **Response** (200):
  ```json
  {
    "user": {
      "id": "userid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```
- **Errors**: 401 (not authenticated), 404 (user not found)

#### POST `/auth/logout` *(Protected)*
- **Response** (200):
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

## Security Implementation Details

### Password Hashing (bcrypt)

**Backend Flow:**
```
1. User submits password in signup/login
2. Backend receives password
3. Bcrypt hashes password with 10 salt rounds
4. Hash stored in MongoDB (never plain text)
5. On login: bcrypt.compare(enteredPassword, storedHash)
```

**Why bcrypt:**
- Slow by design (prevents brute force)
- Salt prevents rainbow tables
- Industry standard for password hashing

**Key Files:**
- [User Model](./src/models/User.js) - Password hashing pre-hook
- [Auth Controller](./src/controllers/authController.js) - Password validation

### JWT Token Protection

**Backend Flow:**
```
1. User logs in successfully
2. Backend generates JWT: sign({ id: userId }, SECRET, { expiresIn: "7d" })
3. Token set in httpOnly cookie HTTP-only, Secure, SameSite=lax, MaxAge=7 days
4. Protected routes verify token and extract userId
5. Request proceeds with req.user populated
```

**Token Header Example:**
```
{
  "alg": "HS256",
  "typ": "JWT"
}

{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1700000000,
  "exp": 1700604800
}
```

**Key Files:**
- [JWT Utils](./src/utils/jwt.js) - Token generation/verification
- [Auth Middleware](./src/middleware/auth.js) - Token validation

### HttpOnly Cookie Security

**Browser Storage:**
```
✅ HttpOnly Cookies (This implementation)
   - Stored in browser's cookie jar
   - NOT accessible via JavaScript (XSS safe)
   - Automatically sent with every request
   - Auto-cleared on expiration

❌ localStorage (DANGEROUS)
   - Accessible to any JavaScript
   - Vulnerable to XSS attacks
   - No auto-cleanup
   - Session persists across windows

❌ sessionStorage (DANGEROUS)
   - Same issues as localStorage
   - Cleared only when tab closes
```

**Cookie Settings:**
```javascript
res.cookie("token", token, {
  httpOnly: true,              // JS cannot access
  secure: true,                 // HTTPS only (prod)
  sameSite: "lax",              // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

**How Frontend Uses It:**
```javascript
const API = axios.create({
  withCredentials: true  // Send cookies with requests
});

// No manual token management!
// Cookies handled by browser automatically
API.get("/auth/me")  // Token sent in cookie
```

### CORS Configuration

**Frontend → Backend Communication:**
```javascript
// Backend (src/app.js)
cors({
  origin: "http://localhost:5173",
  credentials: true  // Allow cookies to be sent/received
})

// Frontend (src/api/auth.js)
axios.create({
  withCredentials: true  // Send credentials (cookies)
})
```

## File Structure Explained

### Backend

```
src/
├── config/db.js                      # MongoDB connection setup
├── controllers/authController.js     # Business logic (signup, login, etc.)
├── middleware/
│   ├── auth.js                      # JWT verification middleware
│   └── error.middleware.js          # Global error handler
├── models/User.js                   # User schema + bcrypt hooks
├── routes/auth.routes.js            # Route definitions
├── utils/jwt.js                     # JWT utility functions
├── app.js                           # Express app setup
└── server.js                        # Server entry + port listener
```

### Frontend

```
src/
├── api/auth.js                      # API calls to backend
├── components/
│   └── ProtectedRoute.jsx          # HOC for route protection
├── pages/
│   ├── Home.jsx                    # Landing page
│   ├── Login.jsx                   # Login form
│   ├── Signup.jsx                  # Signup form
│   └── Dashboard.jsx               # Protected user dashboard
├── App.jsx                         # Route definitions
├── main.jsx                        # React entry point
└── index.css                       # Global styles
```

## How Protected Routes Work

### Frontend Implementation

```jsx
// 1. ProtectedRoute component checks authentication
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// 2. ProtectedRoute verifies token
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  
  useEffect(() => {
    getCurrentUser()  // Calls GET /auth/me
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);

  // 3. Redirects to login if not authenticated
  return isAuth ? children : <Navigate to="/login" />;
};

// 4. Dashboard only renders if isAuth === true
const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    getCurrentUser()  // Validates token on component mount
      .then(res => setUser(res.data.user));
  }, []);
  
  return <div>Welcome {user?.name}!</div>;
};
```

### Backend Verification

```javascript
// Router uses protect middleware
router.get("/me", protect, me);

// protect middleware:
// 1. Extracts token from cookie
// 2. Verifies token signature
// 3. Checks token expiration
// 4. Retrieves user from DB
// 5. Populates req.user
// 6. Calls next() to continue to handler
```

## Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auth-db

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=change-this-to-strong-random-key-in-production
JWT_EXPIRE=7d

# Cookies
COOKIE_EXPIRE=7

# Frontend
CLIENT_URL=http://localhost:5173
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001
```

## Testing with Postman

1. Import `Task3.postman_collection.json` into Postman
2. Test endpoints in order:
   - Run **Signup** (creates new user)
   - Run **Login** (gets token)
   - Run **Get Current User** (verifies token)
   - Run **Logout** (clears token)
   - Try **Get Current User** again (should fail with 401)

**Note:** Postman automatically stores cookies from responses!

## Troubleshooting

### Issue: CORS error when logging in
**Solution**: Ensure backend is running on port 3001 and CORS origin matches

### Issue: Token not being set in cookie
**Solution**: 
- Check if backend is returning token in response
- Verify `credentials: true` in axios config
- Check browser DevTools → Application → Cookies

### Issue: Protected route always redirects to login
**Solution**:
- Verify API call to `/auth/me` succeeds
- Check if cookie is being sent (verify in Network tab)
- Check token expiration

### Issue: Password comparison always fails
**Solution**:
- Verify bcrypt is installed: `npm ls bcryptjs`
- Check that password field is selected in login query: `select("+password")`
- Ensure password is at least 6 characters in signup

## Production Deployment

### Environment Setup
```bash
# Set in production environment
export NODE_ENV=production
export JWT_SECRET=$(openssl rand -hex 32)
export MONGODB_URI=<production-database-url>
```

### Security Checklist
- [ ] `NODE_ENV=production` (enables secure cookies)
- [ ] Strong `JWT_SECRET` (minimum 32 characters)
- [ ] HTTPS enabled (for `secure: true` cookies)
- [ ] Database authentication enabled
- [ ] CORS origins whitelisted
- [ ] Rate limiting implemented
- [ ] Audit logging enabled
- [ ] Regular backups configured

## Further Enhancements

### Session Management
- Implement refresh tokens (separate short-lived and long-lived tokens)
- Add token blacklist for logout
- Implement token rotation

### Additional Security
- Add rate limiting to auth endpoints
- Email verification for new signups
- Password reset with email verification
- Two-factor authentication (2FA)
- Account lockout after failed attempts

### User Management
- Update profile endpoint
- Change password endpoint
- Delete account endpoint
- User roles and permissions

### Monitoring
- Auth attempt logging
- Failed login tracking
- Suspicious activity alerts
- Regular security audits

## Next Steps

1. ✅ Run backend and frontend
2. ✅ Test signup and login
3. ✅ Verify protected routes work
4. ✅ Review SECURITY.md for best practices
5. Review code to understand implementation
6. Modify password policy/token expiration as needed
7. Add additional features (refresh tokens, 2FA, etc.)

## Key Learnings

- **Bcrypt**: Hash passwords, not encrypt them
- **JWT**: Stateless authentication, token expires
- **HttpOnly Cookies**: Most secure token storage method
- **Protected Routes**: Check authentication before rendering sensitive content
- **CORS**: Configure properly for cross-origin requests with credentials
- **Error Messages**: Generic error messages prevent user enumeration attacks
