import { useEffect, useState } from "react";
import {
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";

const ProfileSetup = () => {
  const [form, setForm] = useState({
    bio: "",
    city: "",
    profession: "",
    education: "",
    height: "",
    interests: "",
    relationshipGoal: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/profile/me");
        const profile = response.data.profile;

        if (profile) {
          setForm({
            bio: profile.bio || "",
            city: profile.city || "",
            profession: profile.profession || "",
            education: profile.education || "",
            height: profile.height || "",
            interests: profile.interests ? profile.interests.join(", ") : "",
            relationshipGoal: profile.relationshipGoal || "",
          });
        }
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const trimmedBio = form.bio.trim();
    const trimmedCity = form.city.trim();
    const trimmedProfession = form.profession.trim();
    const trimmedEducation = form.education.trim();

    const interests = form.interests
      ? form.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    if (!trimmedBio) {
      setMessage("Please tell us something about yourself.");
      return;
    }

    if (!trimmedCity) {
      setMessage("Please enter your city.");
      return;
    }

    if (!trimmedProfession) {
      setMessage("Please enter your profession.");
      return;
    }

    if (!trimmedEducation) {
      setMessage("Please enter your education.");
      return;
    }

    if (!form.relationshipGoal) {
      setMessage("Please select your relationship goal.");
      return;
    }

    if (interests.length === 0) {
      setMessage("Please add at least one interest.");
      return;
    }

    try {
      setSaving(true);

      await api.put("/profile/me", {
        bio: trimmedBio,
        city: trimmedCity,
        profession: trimmedProfession,
        education: trimmedEducation,
        height: form.height ? Number(form.height) : undefined,
        interests,
        relationshipGoal: form.relationshipGoal,
      });

      const statusResponse = await api.get("/profile/me/status");

      if (statusResponse.data.profileComplete) {
        setMessage("Profile completed successfully ❤️");

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 700);
      } else {
        setMessage("Please complete all required profile details.");
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-heart">
          <Heart size={30} fill="currentColor" />
        </div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-setup-page">
      <div className="profile-background-shape shape-one"></div>
      <div className="profile-background-shape shape-two"></div>

      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-icon">
            <Heart size={28} fill="currentColor" />
          </div>

          <div>
            <span className="profile-eyebrow">YOUR CONNECTLY PROFILE</span>

            <h1>
              Complete your profile
              <span> ❤️</span>
            </h1>

            <p>
              Tell people a little about yourself and show what makes you
              unique.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="profile-progress">
          <div className="progress-top">
            <span>Profile setup</span>
            <strong>Almost there</strong>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>

        {/* Form card */}
        <form className="profile-card-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="section-title">
              <Sparkles size={19} />
              <div>
                <h2>About you</h2>
                <p>Help people get to know the real you.</p>
              </div>
            </div>

            <label className="form-field full-width">
              <span>About yourself</span>

              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell people about yourself, your personality, hobbies..."
                maxLength={500}
              />

              <small>{form.bio.length}/500</small>
            </label>
          </div>

          <div className="form-divider"></div>

          <div className="form-section">
            <div className="section-title">
              <MapPin size={19} />
              <div>
                <h2>Basic details</h2>
                <p>Some simple details about your life.</p>
              </div>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span>City</span>

                <div className="input-wrapper">
                  <MapPin size={18} />
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur"
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Profession</span>

                <div className="input-wrapper">
                  <Briefcase size={18} />
                  <input
                    type="text"
                    name="profession"
                    value={form.profession}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Education</span>

                <div className="input-wrapper">
                  <GraduationCap size={18} />
                  <input
                    type="text"
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech"
                  />
                </div>
              </label>

              <label className="form-field">
                <span>Height</span>

                <div className="input-wrapper">
                  <Ruler size={18} />
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="Height in cm"
                    min="100"
                    max="250"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="form-divider"></div>

          <div className="form-section">
            <div className="section-title">
              <Heart size={19} />
              <div>
                <h2>What are you looking for?</h2>
                <p>Choose what best describes your intentions.</p>
              </div>
            </div>

            <label className="form-field full-width">
              <span>Relationship goal</span>

              <select
                name="relationshipGoal"
                value={form.relationshipGoal}
                onChange={handleChange}
              >
                <option value="">Select your relationship goal</option>
                <option value="serious_relationship">
                  Serious relationship
                </option>
                <option value="marriage">Marriage</option>
                <option value="casual">Something casual</option>
                <option value="friendship">Friendship</option>
                <option value="not_sure">Not sure yet</option>
              </select>
            </label>

            <label className="form-field full-width">
              <span>Interests</span>

              <input
                type="text"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="Travel, Music, Movies, Cricket..."
              />

              <small>Separate multiple interests with commas.</small>
            </label>
          </div>

          {message && (
            <div
              className={
                message.includes("successfully")
                  ? "profile-message success"
                  : "profile-message error"
              }
            >
              {message}
            </div>
          )}

          <div className="profile-submit">
            <button
              type="submit"
              className="save-profile-button"
              disabled={saving}
            >
              <Heart size={19} fill="currentColor" />

              {saving ? "Saving..." : "Save profile"}
            </button>

            <p>You can update these details anytime from your profile.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
