# Security Guide for JWT Authentication System

## Token Storage Best Practices

### ✅ RECOMMENDED: HttpOnly Cookies

**Implementation:**
```javascript
// Backend sets httpOnly cookie
res.cookie("token", token, {
  httpOnly: true,              // Not accessible to JavaScript
  secure: true,                 // Only sent over HTTPS
  sameSite: "lax",              // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Frontend - No explicit storage needed
// Browser automatically sends cookie with requests
```

**Advantages:**
- Protected from XSS attacks (JavaScript cannot access it)
- Automatically sent with HTTP requests
- CSRF protection via SameSite attribute
- No manual token management needed

**How it works in this implementation:**
- Backend sets httpOnly cookie on login
- Frontend uses `axios` with `withCredentials: true`
- Cookies are automatically sent with every request
- Server validates token from cookie

---

## Security Features Implemented

### 1. Password Hashing with Bcrypt
```javascript
// Passwords are hashed before saving
const salt = await bcrypt.genSalt(10);
this.password = await bcrypt.hash(this.password, salt);

// Verification uses constant-time comparison
const isMatch = await bcrypt.compare(enteredPassword, this.password);
```

**Benefits:**
- Bcrypt is slow (intentionally) to prevent brute-force attacks
- Salt rounds (10) make rainbow table attacks infeasible
- Even if database is compromised, passwords are not exposed

### 2. JWT Token Generation
```javascript
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
```

**Benefits:**
- Stateless authentication (no session storage needed)
- Token expiration prevents long-lived access
- Secret key prevents token forgery

### 3. Protected Routes with Middleware
```javascript
// Middleware extracts token from cookie or header
const protect = async (req, res, next) => {
  const token = req.cookies.token || 
                req.headers.authorization?.split(" ")[1];
  
  const decoded = verifyToken(token);
  req.user = await User.findById(decoded.id);
  next();
};
```

**Usage:**
```javascript
// Only permits authenticated users
router.get("/me", protect, me);
```

---

## Common Security Pitfalls to Avoid

### ❌ NEVER: Store tokens in localStorage
```javascript
// DON'T DO THIS!
localStorage.setItem("token", jwtToken);
```

**Why it's dangerous:**
- XSS attacks can steal tokens (malicious JavaScript)
- No automatic cleanup if browser is compromised
- Tokens exposed in browser DevTools

**What we do instead:**
- Use httpOnly cookies that JavaScript cannot access

---

### ❌ NEVER: Send passwords over HTTP
```javascript
// DON'T DO THIS!
// Sending plain password over unencrypted connection
```

**Why it's dangerous:**
- Network sniffing can capture credentials
- Man-in-the-middle attacks
- Credentials exposed in logs/caches

**What we do instead:**
- Always use HTTPS (enforced in production with `secure: true`)
- Set `NODE_ENV=production` in production

---

### ❌ NEVER: Expose sensitive errors
```javascript
// DON'T DO THIS!
res.json({ message: `User ${email} not found` });
```

**Why it's dangerous:**
- Reveals which emails are registered (user enumeration)
- Exposes database structure
- Helps attackers target accounts

**What we do instead:**
```javascript
// Generic error message
res.status(401).json({ message: "Invalid credentials" });
```

---

### ❌ NEVER: Store secrets in code
```javascript
// DON'T DO THIS!
const JWT_SECRET = "hardcoded-secret-key";
```

**Why it's dangerous:**
- Secrets exposed in version control
- Anyone with code access can forge tokens
- Cannot rotate secrets without redeployment

**What we do instead:**
```javascript
// Store in environment variables
const JWT_SECRET = process.env.JWT_SECRET;
```

---

## Production Checklist

### Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (minimum 32 characters)
- [ ] Set `secure: true` for cookies (HTTPS only)
- [ ] Use different JWT_SECRET for each environment
- [ ] Rotate JWT_SECRET periodically

### Database Security
- [ ] Use MongoDB connection string with authentication
- [ ] Enable MongoDB access control
- [ ] Use strong database passwords
- [ ] Implement database backups
- [ ] Encrypt database connections (TLS)

### CORS Configuration
- [ ] Whitelist only trusted origins
- [ ] Enable `credentials: true` only for same-origin requests
- [ ] Set appropriate headers

### HTTPS/TLS
- [ ] Use HTTPS in production
- [ ] Obtain valid SSL certificate
- [ ] Enable HSTS header
- [ ] Redirect HTTP to HTTPS

### Rate Limiting (Future Enhancement)
```javascript
// Prevent brute-force attacks
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 attempts per window
});

router.post("/login", loginLimiter, login);
```

### Password Policy (Future Enhancement)
- [ ] Minimum 8 characters
- [ ] Require uppercase, lowercase, numbers, symbols
- [ ] Prevent password reuse
- [ ] Enforce password expiration

---

## Frontend Security

### Token Storage
```javascript
// ✅ Good: httpOnly cookie (automatic via credentials: true)
const API = axios.create({
  withCredentials: true
});

// ❌ Bad: localStorage (vulnerable to XSS)
localStorage.setItem("token", token);
```

### Protected Routes
```javascript
// ✅ Good: Verify on every route access
const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);
  
  useEffect(() => {
    getCurrentUser() // Validates token
      .then(() => setIsAuth(true))
      .catch(() => setIsAuth(false));
  }, []);
  
  return isAuth ? children : <Navigate to="/login" />;
};
```

### XSS Prevention
- [ ] Always sanitize user input
- [ ] Use React's built-in XSS protection (auto-escapes)
- [ ] Avoid `dangerouslySetInnerHTML`
- [ ] Content Security Policy headers

---

## Vulnerability Testing

### Test cases to verify security:

1. **Password Security**
   - Verify passwords are hashed (query DB directly)
   - Try brute force (should see bcrypt slow down)

2. **Token Security**
   - Try modifying JWT in cookies
   - Try accessing protected route without token
   - Try expired token (create one manually, wait for expiration)

3. **CORS Security**
   - Try request from different origin
   - Verify credentials are not sent

4. **Error Messages**
   - Try non-existent email (should get generic error)
   - Try invalid password (should get generic error)

---

## Summary

This implementation provides:
- ✅ Secure password hashing (bcrypt)
- ✅ Stateless JWT authentication
- ✅ HttpOnly cookie storage (XSS protected)
- ✅ Protected routes with middleware
- ✅ Generic error messages (no user enumeration)
- ✅ Environment variable secrets
- ✅ CORS with credentials support
- ✅ Token expiration

For production, add:
- Rate limiting on auth endpoints
- Password complexity requirements
- Email verification for new accounts
- Two-factor authentication (2FA)
- Audit logging for security events
- Regular security audits
