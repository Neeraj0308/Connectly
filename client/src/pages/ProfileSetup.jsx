import { useEffect, useState } from "react";
import {
  Heart,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Sparkles,
  Camera,
  X,
  Plus,
} from "lucide-react";
import api from "../api/axios";
import { uploadImageToCloudinary } from "../api/cloudinary";

const MAX_EXTRA_PHOTOS = 5;

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
  const [profilePhoto, setProfilePhoto] = useState({ url: "", publicId: "" });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/profile/me");
        const profile = data.profile;
        setForm({
          bio: profile.bio || "",
          city: profile.city || "",
          profession: profile.profession || "",
          education: profile.education || "",
          height: profile.height || "",
          interests: (profile.interests || []).join(", "),
          relationshipGoal: profile.relationshipGoal || "",
        });
        setProfilePhoto({
          url: profile.profilePhoto || "",
          publicId: profile.profilePhotoPublicId || "",
        });
        setPhotos(
          (profile.photos || []).map((url, index) => ({
            url,
            publicId: profile.photoPublicIds?.[index] || "",
          })),
        );
      } catch (error) {
        console.error("PROFILE LOAD ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const uploadOne = async (file, kind) => {
    if (!file) return;
    setMessage("");
    try {
      setUploading(true);
      const uploaded = await uploadImageToCloudinary(file);
      if (kind === "main") setProfilePhoto(uploaded);
      else setPhotos((current) => [...current, uploaded]);
    } catch (error) {
      setMessage(error.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const chooseMainPhoto = (event) => uploadOne(event.target.files?.[0], "main");

  const chooseExtraPhotos = async (event) => {
    const files = Array.from(event.target.files || []);
    const remaining = MAX_EXTRA_PHOTOS - photos.length;
    if (files.length > remaining) {
      setMessage(
        `You can add only ${remaining} more photo${remaining === 1 ? "" : "s"}.`,
      );
      return;
    }
    for (const file of files) await uploadOne(file, "extra");
    event.target.value = "";
  };

  const removePhoto = (index) =>
    setPhotos((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    const bio = form.bio.trim(),
      city = form.city.trim(),
      profession = form.profession.trim(),
      education = form.education.trim();
    const interests = form.interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!profilePhoto.url) return setMessage("Please add a profile photo.");
    if (
      !bio ||
      !city ||
      !profession ||
      !education ||
      !form.relationshipGoal ||
      interests.length === 0
    )
      return setMessage("Please complete all required profile details.");

    try {
      setSaving(true);
      await api.put("/profile/me", {
        bio,
        city,
        profession,
        education,
        height: form.height ? Number(form.height) : undefined,
        interests,
        relationshipGoal: form.relationshipGoal,
        profilePhoto: profilePhoto.url,
        profilePhotoPublicId: profilePhoto.publicId,
        photos: photos.map((item) => item.url),
        photoPublicIds: photos.map((item) => item.publicId),
      });
      const { data } = await api.get("/profile/me/status");
      if (data.profileComplete) {
        setMessage("Profile completed successfully.");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      } else setMessage("Please complete the remaining profile details.");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to save your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="profile-loading">
        <div className="loading-heart">
          <Heart size={30} fill="currentColor" />
        </div>
        <p>Loading your profile...</p>
      </div>
    );

  return (
    <div className="profile-setup-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-icon">
            <Heart size={28} fill="currentColor" />
          </div>
          <div>
            <span className="profile-eyebrow">YOUR CONNECTLY PROFILE</span>
            <h1>
              Complete your profile <span>❤️</span>
            </h1>
            <p>Add your details and photos before exploring Connectly.</p>
          </div>
        </div>
        <form className="profile-card-form" onSubmit={submit}>
          <div className="form-section photo-section">
            <div className="section-title">
              <Camera size={19} />
              <div>
                <h2>Your photos</h2>
                <p>One main photo and up to 5 additional photos.</p>
              </div>
            </div>
            <div className="profile-photo-manager">
              <div className="main-photo-upload">
                <label
                  className="profile-photo-picker"
                  htmlFor="mainProfilePhoto"
                >
                  {profilePhoto.url ? (
                    <img src={profilePhoto.url} alt="Profile" />
                  ) : (
                    <>
                      <Camera size={28} />
                      <span>Add profile photo</span>
                      <small>Required · max 5MB</small>
                    </>
                  )}
                </label>
                <input
                  id="mainProfilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={chooseMainPhoto}
                  disabled={uploading}
                />
                {profilePhoto.url && (
                  <label
                    htmlFor="mainProfilePhoto"
                    className="profile-photo-change"
                  >
                    Change main photo
                  </label>
                )}
              </div>
              <div className="extra-photo-grid">
                {photos.map((photo, index) => (
                  <div
                    className="extra-photo-card"
                    key={`${photo.publicId}-${index}`}
                  >
                    <img src={photo.url} alt={`Gallery ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label="Remove photo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_EXTRA_PHOTOS && (
                  <label className="extra-photo-add" htmlFor="extraPhotos">
                    <Plus size={24} />
                    <span>Add photos</span>
                    <small>
                      {MAX_EXTRA_PHOTOS - photos.length} slot
                      {MAX_EXTRA_PHOTOS - photos.length === 1 ? "" : "s"} left
                    </small>
                  </label>
                )}
                <input
                  id="extraPhotos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={chooseExtraPhotos}
                  disabled={uploading}
                  hidden
                />
              </div>
            </div>
            {uploading && (
              <p className="profile-photo-uploading">
                Uploading image to Cloudinary...
              </p>
            )}
          </div>
          <div className="form-divider" />
          <div className="form-section">
            <div className="section-title">
              <Sparkles size={19} />
              <div>
                <h2>About you</h2>
                <p>Help people get to know you.</p>
              </div>
            </div>
            <label className="form-field full-width">
              <span>About yourself</span>
              <textarea
                name="bio"
                value={form.bio}
                onChange={change}
                maxLength={500}
                placeholder="Tell people about yourself..."
              />
              <small>{form.bio.length}/500</small>
            </label>
          </div>
          <div className="form-divider" />
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
                    name="city"
                    value={form.city}
                    onChange={change}
                    placeholder="e.g. Jaipur"
                  />
                </div>
              </label>
              <label className="form-field">
                <span>Profession</span>
                <div className="input-wrapper">
                  <Briefcase size={18} />
                  <input
                    name="profession"
                    value={form.profession}
                    onChange={change}
                    placeholder="e.g. Software Developer"
                  />
                </div>
              </label>
              <label className="form-field">
                <span>Education</span>
                <div className="input-wrapper">
                  <GraduationCap size={18} />
                  <input
                    name="education"
                    value={form.education}
                    onChange={change}
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
                    onChange={change}
                    min="100"
                    max="250"
                    placeholder="Height in cm"
                  />
                </div>
              </label>
            </div>
          </div>
          <div className="form-divider" />
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
                onChange={change}
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
                name="interests"
                value={form.interests}
                onChange={change}
                placeholder="Travel, Music, Movies, Cricket..."
              />
              <small>Separate multiple interests with commas.</small>
            </label>
          </div>
          {message && <div className="profile-message error">{message}</div>}
          <div className="profile-submit">
            <button
              className="save-profile-button"
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
            <p>You can update these details anytime.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
