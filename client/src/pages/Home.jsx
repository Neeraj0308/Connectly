import { Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const Home = () => {
  return (
    <div className="home-page">
      {/* NAVBAR */}
      <header className="home-navbar">
        <Link to="/" className="home-brand">
          <Heart size={27} fill="currentColor" />
          <span>Connectly</span>
        </Link>

        <nav className="home-nav-links">
          <Link to="/login">Login</Link>

          <Link to="/register" className="home-nav-register">
            Create account
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <main className="home-hero">
        <div className="home-hero-content">
          <div className="home-badge">
            <Sparkles size={15} />
            <span>Meet. Connect. Discover.</span>
          </div>

          <h1>
            Find someone
            <br />
            <span>worth connecting with.</span>
          </h1>

          <p className="home-description">
            Meet genuine people, build meaningful connections, and discover
            someone who shares your interests, values, and goals.
          </p>

          <div className="home-actions">
            <Link to="/register" className="home-primary-button">
              Create your account
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="home-secondary-button">
              I already have an account
            </Link>
          </div>

          <div className="home-trust">
            <div>
              <CheckCircle2 size={16} />
              <span>18+ only</span>
            </div>

            <div>
              <ShieldCheck size={16} />
              <span>Privacy focused</span>
            </div>

            <div>
              <Heart size={16} />
              <span>Real connections</span>
            </div>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="home-visual">
          <div className="floating-card floating-card-one">
            <div className="floating-avatar avatar-one">👩</div>

            <div>
              <strong>Discover</strong>
              <span>People near you</span>
            </div>
          </div>

          <div className="main-heart-card">
            <div className="heart-glow">
              <Heart size={75} fill="currentColor" />
            </div>

            <h2>Made for meaningful connections</h2>

            <p>Like someone, match with them, and start a conversation.</p>
          </div>

          <div className="floating-card floating-card-two">
            <div className="floating-avatar avatar-two">👨</div>

            <div>
              <strong>It's a match!</strong>
              <span>Start chatting</span>
            </div>

            <MessageCircle size={21} className="floating-message-icon" />
          </div>
        </div>
      </main>

      {/* FEATURES */}
      <section className="home-features">
        <div className="home-section-heading">
          <span>WHY CONNECTLY</span>

          <h2>
            Dating should feel
            <br />
            <strong>simple and genuine.</strong>
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Heart size={23} />
            </div>

            <h3>Meaningful matches</h3>

            <p>
              Discover people based on interests, preferences, and what you're
              looking for.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle size={23} />
            </div>

            <h3>Real conversations</h3>

            <p>
              Match first, then start a private conversation with your
              connection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={23} />
            </div>

            <h3>Safety first</h3>

            <p>
              Built with privacy, reporting, blocking, and account protection in
              mind.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div>
          <span className="home-cta-small">
            YOUR NEXT CONNECTION COULD BE HERE
          </span>

          <h2>
            Ready to meet
            <br />
            someone new?
          </h2>

          <p>
            Create your profile and start discovering people who could be a
            great match.
          </p>

          <Link to="/register" className="home-primary-button">
            Get started
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="cta-heart">
          <Heart size={125} fill="currentColor" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-brand footer-brand">
          <Heart size={21} fill="currentColor" />
          Connectly
        </div>

        <p>© 2026 Connectly. Built for meaningful connections.</p>

        <div className="footer-links">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
