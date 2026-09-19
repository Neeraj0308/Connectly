import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, MapPin } from "lucide-react";

import api from "../api/axios";

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await api.get("/matches");

        console.log("MATCHES RESPONSE:", response.data);

        setMatches(response.data.matches || []);
      } catch (error) {
        console.error("LOAD MATCHES ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading your matches...</p>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-header">
        <span className="eyebrow">CONNECTIONS</span>

        <h1>Your Matches ❤️</h1>

        <p>People who liked you back.</p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-matches">
          <div>💞</div>

          <h2>No matches yet</h2>

          <p>Keep discovering and your connection might be next.</p>

          <Link to="/discover" className="primary-button">
            Find people
          </Link>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div className="match-card" key={match.matchId}>
              <div className="match-photo">
                {match.profile?.profilePhoto ? (
                  <img
                    src={match.profile.profilePhoto}
                    alt={match.user?.name || "Match"}
                  />
                ) : (
                  <div>👤</div>
                )}
              </div>

              <div className="match-info">
                <h2>{match.user?.name || "Your Match"}</h2>

                {match.profile?.city && (
                  <p>
                    <MapPin size={15} />
                    {match.profile.city}
                  </p>
                )}

                {/* IMPORTANT:
                    Use match.matchId,
                    NOT match._id
                */}

                <Link to={`/chat/${match.matchId}`} className="chat-button">
                  <MessageCircle size={17} />
                  Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Matches;
