# Authentication System UI

React frontend for the JWT-based authentication system.

## Features

- **Signup Form**: Create new user accounts
- **Login Form**: Authenticate existing users
- **Protected Routes**: Dashboard only accessible when logged in
- **Token Management**: Automatic token handling via httpOnly cookies
- **User Profile**: View authenticated user information

## Setup

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env.local`:

```
VITE_API_URL=http://localhost:3001
```

## Security Notes

- Tokens are stored in **httpOnly cookies** (not accessible to JavaScript)
- Cookies are sent automatically with each request via `withCredentials: true`
- Sessions expire after 7 days
- Passwords are hashed on the backend with bcrypt
