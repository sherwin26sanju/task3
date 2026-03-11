import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../api/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        setError("Failed to fetch user data");
        // Redirect to login if not authenticated
        setTimeout(() => navigate("/login"), 1000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      setError("Logout failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="user-info">
        <h2>Your Profile</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p className="info-note"> This page is protected - you can only see it when logged in.</p>
      </div>

      <div className="security-info">
        <h3>Security Notes</h3>
        <ul>
          <li>Your session is protected by JWT authentication</li>
          <li>Token is stored in an httpOnly cookie (not accessible to JavaScript)</li>
          <li>Cookie is sent automatically with each request</li>
          <li>Token expires in 7 days</li>
        </ul>
      </div>
    </div>
  );
}
