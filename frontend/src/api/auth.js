import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true // Send cookies with requests
});

// Signup
export const signup = (data) => API.post("/auth/signup", data);

// Login
export const login = (data) => API.post("/auth/login", data);

// Logout
export const logout = () => API.post("/auth/logout");

// Get current user
export const getCurrentUser = () => API.get("/auth/me");
