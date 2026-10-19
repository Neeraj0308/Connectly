import { useEffect, useState } from "react";
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
  Camera,
} from "lucide-react";
import api from "../api/axios";
import { uploadRegistrationPhoto } from "../api/cloudinary";

const getMaxDateFor18 = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().slice(0, 10);
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setError("");
  };

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return setError("Only JPG, PNG and WEBP images are allowed.");
    if (file.size > 5 * 1024 * 1024)
      return setError("Profile photo must be smaller than 5MB.");
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!photo) return setError("A profile photo is required.");
    if (form.password.length < 8)
      return setError("Password must be at least 8 characters.");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", form);
      const uploadedPhoto = await uploadRegistrationPhoto(photo);
      navigate("/verify-registration", {
        state: { email: data.email, photo: uploadedPhoto, preview },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start registration.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <Link to="/" className="auth-logo">
          <Heart size={28} fill="currentColor" />
          <span>Connectly</span>
        </Link>
        <div className="auth-brand-content">
          <div className="auth-small-badge">
            <Heart size={14} fill="currentColor" /> Find meaningful connections
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

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <Heart size={25} fill="currentColor" /> Connectly
          </div>
          <div className="auth-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Verify your email before your Connectly account is created.</p>
          </div>
          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <label htmlFor="name">Your name</label>
              <div className="auth-input-wrapper">
                <User size={18} />
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@gmail.com"
                  required
                />
              </div>
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={change}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
            </div>
            <div className="auth-two-columns">
              <div className="auth-field">
                <label htmlFor="dateOfBirth">Date of birth</label>
                <div className="auth-input-wrapper">
                  <Calendar size={18} />
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={change}
                    max={getMaxDateFor18()}
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
                    value={form.gender}
                    onChange={change}
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
            <div className="auth-field">
              <label>Profile photo</label>
              <label htmlFor="registerPhoto" className="register-photo-upload">
                {preview ? (
                  <div className="register-photo-preview">
                    <img src={preview} alt="Preview" />
                    <div className="register-photo-overlay">
                      <Camera size={22} />
                      <span>Change photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="register-photo-empty">
                    <Camera size={28} />
                    <strong>Add your profile photo</strong>
                    <span>JPG, PNG or WEBP · Max 5MB</span>
                  </div>
                )}
              </label>
              <input
                id="registerPhoto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhoto}
                hidden
              />
            </div>
            <button
              className="auth-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                "Sending code..."
              ) : (
                <>
                  Continue to email verification <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
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
