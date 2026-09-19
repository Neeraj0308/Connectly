import { useEffect, useState } from "react";
import { Heart, MapPin, Crown, Sparkles } from "lucide-react";

import { Link } from "react-router-dom";
import api from "../api/axios";

const WhoLikedMe = () => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [premiumRequired, setPremiumRequired] = useState(false);

  useEffect(() => {
    loadLikes();
  }, []);

  const loadLikes = async () => {
    try {
      const response = await api.get("/interactions/who-liked-me");

      setLikes(response.data.likes || []);
    } catch (error) {
      if (error.response?.data?.code === "PREMIUM_REQUIRED") {
        setPremiumRequired(true);
      }

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (premiumRequired) {
    return (
      <div className="who-liked-page">
        <div className="premium-lock-card">
          <div className="premium-lock-icon">
            <Crown size={34} />
          </div>

          <span className="eyebrow">PREMIUM FEATURE</span>

          <h1>See who already likes you ❤️</h1>

          <p>
            Stop guessing. Premium lets you see people who have already shown
            interest in you.
          </p>

          <div className="locked-benefits">
            <div>
              <Heart size={18} />
              See your admirers
            </div>

            <div>
              <Sparkles size={18} />
              Match faster
            </div>
          </div>

          <Link to="/premium" className="primary-button">
            <Crown size={18} />
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="who-liked-page">
      <div className="who-liked-header">
        <span className="eyebrow">PREMIUM</span>

        <h1>Who liked you ❤️</h1>

        <p>These people are interested in connecting with you.</p>
      </div>

      {likes.length === 0 ? (
        <div className="empty-matches">
          <div>💗</div>

          <h2>No likes yet</h2>

          <p>Keep your profile active and someone might be next.</p>

          <Link to="/discover" className="primary-button">
            Discover people
          </Link>
        </div>
      ) : (
        <div className="who-liked-grid">
          {likes.map((like) => (
            <div className="liked-person-card" key={like.interactionId}>
              <div className="liked-person-photo">
                {like.profile?.profilePhoto ? (
                  <img src={like.profile.profilePhoto} alt={like.user.name} />
                ) : (
                  <span>👤</span>
                )}

                <div className="liked-heart">
                  <Heart size={17} fill="currentColor" />
                </div>
              </div>

              <div className="liked-person-info">
                <h2>{like.user.name}</h2>

                {like.profile?.city && (
                  <p>
                    <MapPin size={14} />
                    {like.profile.city}
                  </p>
                )}

                {like.profile?.bio && (
                  <p className="liked-bio">{like.profile.bio}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhoLikedMe;
