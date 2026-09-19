import { useEffect, useState } from "react";
import {
  Heart,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Discover = () => {
  const [profiles, setProfiles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [currentPhoto, setCurrentPhoto] = useState(0);

  const [showMatch, setShowMatch] = useState(false);

  const [matchedProfile, setMatchedProfile] = useState(null);
  const [likeStatus, setLikeStatus] = useState(null);

  const loadProfiles = async () => {
    try {
      setLoading(true);

      const response = await api.get("/interactions/discover");

      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error(error);

      setMessage(error.response?.data?.message || "Unable to load profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    const loadLikeStatus = async () => {
      try {
        const response = await api.get("/interactions/like-status");

        setLikeStatus(response.data);
      } catch (error) {
        console.error(error);
      }
    };
  }, []);

  const currentProfile = profiles[0];

  const removeCurrentProfile = () => {
    setProfiles((current) => current.slice(1));

    setCurrentPhoto(0);
  };

  const handleAction = async (action) => {
    if (!currentProfile) return;

    try {
      const response = await api.post(
        `/interactions/${currentProfile.user.id}/${action}`,
      );

      if (action === "like" && response.data.matched) {
        setMatchedProfile(currentProfile);

        setShowMatch(true);
      }

      removeCurrentProfile();
    } catch (error) {
      console.error(error);

      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const nextPhoto = () => {
    if (!currentProfile) return;

    const photos = [
      currentProfile.profile.profilePhoto,
      ...(currentProfile.profile.photos || []),
    ].filter(Boolean);

    if (photos.length === 0) return;

    setCurrentPhoto((currentPhoto + 1) % photos.length);
  };

  const previousPhoto = () => {
    if (!currentProfile) return;

    const photos = [
      currentProfile.profile.profilePhoto,
      ...(currentProfile.profile.photos || []),
    ].filter(Boolean);

    if (photos.length === 0) return;

    setCurrentPhoto((currentPhoto - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="loader" />
        <p>Finding people for you...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="page-center">
        <Heart size={55} />

        <h1>No more profiles</h1>

        <p>You've seen everyone available right now.</p>

        <button className="primary-button" onClick={loadProfiles}>
          Discover again
        </button>
      </div>
    );
  }

  const photos = [
    currentProfile.profile.profilePhoto,
    ...(currentProfile.profile.photos || []),
  ].filter(Boolean);

  const photo = photos[currentPhoto] || null;

  return (
    <>
      <div className="discover-page">
        <div className="discover-header">
          <div>
            <span className="eyebrow">DISCOVER</span>

            <h1>Find your connection ❤️</h1>

            <p>People who may be a good match for you.</p>
          </div>

          <div className="profile-count">{profiles.length} nearby</div>
        </div>

        {message && <div className="toast">{message}</div>}

        <div className="card-wrapper">
          <div className="profile-card">
            <div className="profile-image">
              {photo ? (
                <img src={photo} alt={currentProfile.user.name} />
              ) : (
                <div className="no-photo">
                  <UserPlaceholder />
                </div>
              )}

              {photos.length > 1 && (
                <>
                  <button className="photo-button left" onClick={previousPhoto}>
                    <ChevronLeft />
                  </button>

                  <button className="photo-button right" onClick={nextPhoto}>
                    <ChevronRight />
                  </button>

                  <div className="photo-indicators">
                    {photos.map((_, index) => (
                      <span
                        key={index}
                        className={index === currentPhoto ? "active" : ""}
                      />
                    ))}
                  </div>
                </>
              )}

              {currentProfile.user.isVerified && (
                <div className="verified-badge">✓ Verified</div>
              )}
            </div>

            <div className="profile-content">
              <h2>
                {currentProfile.user.name}
                <span>, {currentProfile.user.age}</span>
              </h2>

              {currentProfile.profile.city && (
                <div className="profile-detail">
                  <MapPin size={17} />
                  {currentProfile.profile.city}
                </div>
              )}

              {currentProfile.profile.profession && (
                <div className="profile-detail">
                  <Briefcase size={17} />
                  {currentProfile.profile.profession}
                </div>
              )}

              {currentProfile.profile.education && (
                <div className="profile-detail">
                  <GraduationCap size={17} />
                  {currentProfile.profile.education}
                </div>
              )}

              {currentProfile.profile.bio && (
                <p className="bio">{currentProfile.profile.bio}</p>
              )}

              {currentProfile.profile.interests?.length > 0 && (
                <div className="interests">
                  {currentProfile.profile.interests.map((interest) => (
                    <span key={interest}>{interest}</span>
                  ))}
                </div>
              )}

              {currentProfile.commonInterests?.length > 0 && (
                <p className="common">
                  ❤️ {currentProfile.commonInterests.length} common interests
                </p>
              )}
            </div>
          </div>
          <div className="discover-action-buttons">
            <button
              type="button"
              className="discover-action-button discover-pass-button"
              onClick={() => handleAction("pass")}
              title="Pass"
              aria-label="Pass"
            >
              <X size={30} strokeWidth={2.5} color="#ff3f76" />
            </button>

            <button
              type="button"
              className="discover-action-button discover-like-button"
              onClick={() => handleAction("like")}
              title="Like"
              aria-label="Like"
            >
              <Heart
                size={30}
                strokeWidth={2.5}
                color="#ffffff"
                fill="#ffffff"
              />
            </button>
          </div>{" "}
        </div>
      </div>

      {showMatch && matchedProfile && (
        <div className="match-overlay">
          <div className="match-modal">
            <div className="match-heart">❤️</div>

            <span className="eyebrow">IT'S A MATCH</span>

            <h2>You and {matchedProfile.user.name} like each other!</h2>

            <p>Start a conversation and see where it goes.</p>

            <button
              className="primary-button"
              onClick={() => setShowMatch(false)}
            >
              Continue discovering
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const UserPlaceholder = () => <div className="placeholder-icon">👤</div>;

export default Discover;
