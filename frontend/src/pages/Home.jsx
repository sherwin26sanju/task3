export default function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Auth System Demo</h1>
        <p>Secure authentication with JWT and bcrypt</p>
        
        <div className="hero-buttons">
          <a href="/login" className="btn btn-primary">Login</a>
          <a href="/signup" className="btn btn-secondary">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
