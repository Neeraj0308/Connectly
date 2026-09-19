import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Mail,
  Lock,
  User,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api from "../api/axios";

const getMaxDateFor18 = () => {
  const today = new Date();

  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  const year = maxDate.getFullYear();
  const month = String(maxDate.getMonth() + 1).padStart(2, "0");
  const day = String(maxDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;

  const today = new Date();
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxDate = getMaxDateFor18();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "dateOfBirth") {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.dateOfBirth ||
      !formData.gender
    ) {
      setError("Please fill in all fields.");
      return;
    }

    /* ================================
       AGE VALIDATION
    ================================= */

    const age = calculateAge(formData.dateOfBirth);

    if (age < 18) {
      setError("You must be at least 18 years old to join Connectly.");
      return;
    }

    /* Prevent future DOB */
    const selectedDate = new Date(`${formData.dateOfBirth}T00:00:00`);

    const today = new Date();

    if (selectedDate > today) {
      setError("Please enter a valid date of birth.");
      return;
    }

    /* ================================
       REGISTER
    ================================= */

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);

      localStorage.setItem("user", JSON.stringify(user));

      /* New users MUST complete profile */

      navigate("/profile/setup", {
        replace: true,
      });
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);

      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* LEFT SIDE */}

      <div className="auth-brand-side">
        <Link to="/" className="auth-logo">
          <Heart size={28} fill="currentColor" />

          <span>Connectly</span>
        </Link>

        <div className="auth-brand-content">
          <div className="auth-small-badge">
            <Heart size={14} fill="currentColor" />
            Find meaningful connections
          </div>

          <h1>
            Your next
            <br />
            <span>connection</span>
            <br />
            starts here.
          </h1>

          <p>
            Create your profile, discover interesting people, and start building
            genuine connections.
          </p>
        </div>

        <div className="auth-brand-bottom">
          <ShieldCheck size={17} />

          <span>Your privacy matters to us.</span>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <Heart size={25} fill="currentColor" />
            Connectly
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">GET STARTED</span>

            <h2>Create your account</h2>

            <p>
              Join Connectly and start meeting people who share your interests.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* NAME */}

            <div className="auth-field">
              <label htmlFor="name">Your name</label>

              <div className="auth-input-wrapper">
                <User size={18} />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

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
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <label htmlFor="password">Password</label>

              <div className="auth-input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            {/* DOB + GENDER */}

            <div className="auth-two-columns">
              <div className="auth-field">
                <label htmlFor="dateOfBirth">Date of birth</label>

                <div className="auth-input-wrapper">
                  <Calendar size={18} />

                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={maxDate}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="gender">Gender</label>

                <div className="auth-input-wrapper">
                  <Users size={18} />

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>

                    <option value="male">Male</option>

                    <option value="female">Female</option>

                    <option value="non_binary">Non-binary</option>

                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AGE NOTICE */}

            <div className="auth-info">
              <ShieldCheck size={17} />

              <p>
                Connectly is for people aged 18 and above. You must be at least
                18 years old to create an account.
              </p>
            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* LOGIN */}

          <div className="auth-switch">
            <span>Already have an account?</span>

            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
