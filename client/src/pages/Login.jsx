import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your details.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* =========================================
          LEFT BRAND SIDE
      ========================================= */}

      <div className="auth-brand-side">
        <Link to="/" className="auth-logo">
          <Heart size={28} fill="currentColor" />
          <span>Connectly</span>
        </Link>

        <div className="auth-brand-content">
          <div className="auth-small-badge">
            <Heart size={14} fill="currentColor" />
            Welcome back
          </div>

          <h1>
            Continue your
            <br />
            <span>connection</span>
            <br />
            journey.
          </h1>

          <p>
            Your matches and conversations are waiting for you. Log in and
            continue where you left off.
          </p>
        </div>

        <div className="auth-brand-bottom">
          <ShieldCheck size={17} />
          <span>Your privacy matters to us.</span>
        </div>
      </div>

      {/* =========================================
          RIGHT LOGIN FORM
      ========================================= */}

      <div className="auth-form-side">
        <div className="auth-form-container">
          {/* MOBILE LOGO */}

          <div className="auth-mobile-logo">
            <Heart size={25} fill="currentColor" />
            Connectly
          </div>

          {/* HEADING */}

          <div className="auth-heading">
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h2>Welcome back</h2>

            <p>Log in to continue discovering meaningful connections.</p>
          </div>

          {/* ERROR */}

          {error && <div className="auth-error">{error}</div>}

          {/* FORM */}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* EMAIL */}

            <div className="auth-field">
              <label htmlFor="email">Email address</label>

              <div className="auth-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">Password</label>

                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <div className="auth-input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Log in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* SECURITY */}

          <div className="auth-info login-security">
            <ShieldCheck size={17} />

            <p>
              Your account and conversations are protected. Never share your
              password with anyone.
            </p>
          </div>

          {/* REGISTER */}

          <div className="auth-switch">
            <span>Don't have an account?</span>

            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
