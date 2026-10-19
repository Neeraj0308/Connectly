import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Mail, ShieldCheck } from "lucide-react";
import api from "../api/axios";

const VerifyRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const photo = location.state?.photo;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !photo) navigate("/register", { replace: true });
  }, [email, photo, navigate]);

  const verify = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email.");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-registration", {
        email,
        otp,
        profilePhoto: photo.url,
        profilePhotoPublicId: photo.publicId,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile/setup", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      setResending(true); setError(""); setMessage("");
      const { data } = await api.post("/auth/resend-registration-otp", { email });
      setMessage(data.message);
    } catch (err) { setError(err.response?.data?.message || "Could not send a new code."); }
    finally { setResending(false); }
  };

  return <div className="auth-page"><div className="auth-brand-side"><Link to="/" className="auth-logo"><Heart size={28} fill="currentColor" /><span>Connectly</span></Link><div className="auth-brand-content"><div className="auth-small-badge"><ShieldCheck size={14} /> Email verification</div><h1>One quick<br /><span>security</span><br />step.</h1><p>We verify your email before creating your account.</p></div></div><div className="auth-form-side"><div className="auth-form-container"><div className="auth-mobile-logo"><Heart size={25} fill="currentColor" /> Connectly</div><div className="auth-heading"><span className="auth-eyebrow">CHECK YOUR EMAIL</span><h2>Verify your email</h2><p>We sent a 6-digit code to <strong>{email}</strong>.</p></div>{error && <div className="auth-error">{error}</div>}{message && <div className="auth-success">{message}</div>}<form className="auth-form" onSubmit={verify}><div className="auth-field"><label htmlFor="otp">Verification code</label><div className="auth-input-wrapper"><Mail size={18} /><input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }} placeholder="123456" required /></div></div><button className="auth-submit-button" disabled={loading}>{loading ? "Verifying..." : <>Verify & create account <ArrowRight size={18} /></>}</button></form><button className="text-button" onClick={resend} disabled={resending}>{resending ? "Sending..." : "Didn't receive the code? Send again"}</button><div className="auth-info"><ShieldCheck size={17} /><p>Your account is created only after the email code is verified.</p></div></div></div></div>;
};

export default VerifyRegistration;
