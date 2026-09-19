import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, User, LogOut, Crown } from "lucide-react";
import { Bell } from "lucide-react";
const AppLayout = ({ children }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="app-layout">
      <header className="navbar">
        <Link to="/dashboard" className="brand">
          <Heart size={25} fill="currentColor" />
          Connectly
        </Link>

        <nav className="nav-links">
          <Link to="/discover">
            <Heart size={18} />
            Discover
          </Link>

          <Link to="/matches">
            <MessageCircle size={18} />
            Matches
          </Link>

          <Link to="/premium">
            <Crown size={18} />
            Premium
          </Link>
          <Link to="/who-liked-me">
            <Heart size={18} />
            Who liked me
          </Link>

          <Link to="/notifications" className="notification-nav-link">
            <Bell size={18} />
            Notifications
          </Link>

          <Link to="/profile/setup">
            <User size={18} />
            Profile
          </Link>

          <button onClick={logout} className="logout-button">
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {user && <div className="nav-user">Hi, {user.name}</div>}
      </header>

      <main>{children}</main>
    </div>
  );
};

export default AppLayout;
