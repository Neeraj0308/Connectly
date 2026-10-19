import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Lock, Mail, ShieldCheck } from "lucide-react";
import api from "../api/axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestCode = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the reset code.");
    } finally {
      setLoading(false);
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password.length < 8)
      return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset your password.");
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
            <Lock size={14} /> Account recovery
          </div>
          <h1>
            Get back to
            <br />
            <span>your account.</span>
          </h1>
          <p>Use a one-time code sent to your verified email.</p>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-mobile-logo">
            <Heart size={25} fill="currentColor" /> Connectly
          </div>
          <div className="auth-heading">
            <span className="auth-eyebrow">PASSWORD RESET</span>
            <h2>{step === 3 ? "Password updated" : "Forgot your password?"}</h2>
            <p>
              {step === 1
                ? "Enter your verified email and we'll send a reset code."
                : step === 2
                  ? `Enter the code sent to ${email} and choose a new password.`
                  : "Your password has been changed successfully."}
            </p>
          </div>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}
          {step === 1 && (
            <form className="auth-form" onSubmit={requestCode}>
              <div className="auth-field">
                <label>Email address</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="auth-submit-button" disabled={loading}>
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    Send reset code <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
          {step === 2 && (
            <form className="auth-form" onSubmit={reset}>
              <div className="auth-field">
                <label>6-digit code</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>New password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="auth-field">
                <label>Confirm password</label>
                <div className="auth-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="auth-submit-button" disabled={loading}>
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    Reset password <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
          {step === 3 && (
            <Link className="auth-submit-button" to="/login">
              Back to login <ArrowRight size={18} />
            </Link>
          )}
          <div className="auth-info">
            <ShieldCheck size={17} />
            <p>
              Reset codes expire after 10 minutes and only the latest code
              remains active.
            </p>
          </div>
          <div className="auth-switch">
            <span>Remembered your password?</span>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
