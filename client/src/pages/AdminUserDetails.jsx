import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
} from "lucide-react";
import api from "../api/axios";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/users/${userId}`);

      setUser(response.data.user);
      setProfile(response.data.profile);
    } catch (error) {
      console.error("ADMIN USER DETAILS ERROR:", error);

      setError(
        error.response?.data?.message || "Unable to load user",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  const changeStatus = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      setError("");

      if (user.isActive) {
        await api.patch(
          `/admin/users/${user._id}/deactivate`,
        );
      } else {
        await api.patch(
          `/admin/users/${user._id}/activate`,
        );
      }

      await loadUser();
    } catch (error) {
      console.error("ADMIN USER STATUS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to update user status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this user? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      await api.delete(`/admin/users/${userId}`);

      alert("User deleted successfully");

      navigate("/admin");
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to delete user",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading user...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-center">
        <p>{error || "User not found"}</p>

        <Link to="/admin" className="primary-button">
          Back to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-user-page">
      <div className="admin-user-topbar">
        <Link
          to="/admin"
          className="admin-back-button"
        >
          <ArrowLeft size={18} />
          Back to Admin
        </Link>
      </div>

      <div className="admin-user-profile-card">
        <div className="admin-user-profile-header">
          <div className="admin-large-avatar">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="admin-user-heading">
            <div className="admin-user-title-row">
              <h1>{user.name}</h1>

              {user.role === "admin" && (
                <span className="admin-role admin-role-admin">
                  Admin
                </span>
              )}
            </div>

            <p>{user.email}</p>

            <div className="admin-user-status-row">
              <span
                className={`admin-status ${
                  user.isActive
                    ? "admin-status-active"
                    : "admin-status-inactive"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>

              <span className="admin-premium-status">
                {user.isPremium ? "Premium" : "Free"}
              </span>
            </div>
          </div>

          {user.role !== "admin" && (
            <div className="admin-user-actions">
              <button
                type="button"
                className={
                  user.isActive
                    ? "admin-action-danger"
                    : "admin-action-success"
                }
                disabled={
                  actionLoading || deleteLoading
                }
                onClick={changeStatus}
              >
                {actionLoading
                  ? "Updating..."
                  : user.isActive
                    ? "Deactivate User"
                    : "Activate User"}
              </button>

              <button
                type="button"
                className="admin-danger-button"
                disabled={
                  actionLoading || deleteLoading
                }
                onClick={handleDeleteUser}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete User"}
              </button>
            </div>
          )}
        </div>

        <div className="admin-detail-grid">
          <div className="admin-detail-item">
            <User size={18} />

            <div>
              <span>Gender</span>
              <strong>
                {user.gender || "Not provided"}
              </strong>
            </div>
          </div>

          <div className="admin-detail-item">
            <Heart size={18} />

            <div>
              <span>Date of Birth</span>

              <strong>
                {user.dateOfBirth
                  ? new Date(
                      user.dateOfBirth,
                    ).toLocaleDateString()
                  : "Not provided"}
              </strong>
            </div>
          </div>

          <div className="admin-detail-item">
            <ShieldCheck size={18} />

            <div>
              <span>Verified</span>

              <strong>
                {user.isVerified ? "Yes" : "No"}
              </strong>
            </div>
          </div>

          <div className="admin-detail-item">
            <ShieldAlert size={18} />

            <div>
              <span>Account Created</span>

              <strong>
                {user.createdAt
                  ? new Date(
                      user.createdAt,
                    ).toLocaleDateString()
                  : "Not provided"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-user-profile-card">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">
              PROFILE
            </span>

            <h2>Profile Information</h2>
          </div>
        </div>

        {!profile ? (
          <div className="admin-empty">
            <User size={35} />

            <p>
              This user has not completed a profile.
            </p>
          </div>
        ) : (
          <div className="admin-profile-details">
            <div className="admin-profile-detail">
              <Heart size={18} />

              <div>
                <span>Bio</span>

                <p>
                  {profile.bio ||
                    "No bio provided"}
                </p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <MapPin size={18} />

              <div>
                <span>City</span>

                <p>
                  {profile.city ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <Briefcase size={18} />

              <div>
                <span>Profession</span>

                <p>
                  {profile.profession ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <GraduationCap size={18} />

              <div>
                <span>Education</span>

                <p>
                  {profile.education ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <Heart size={18} />

              <div>
                <span>Relationship Goal</span>

                <p>
                  {profile.relationshipGoal ||
                    "Not provided"}
                </p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <Heart size={18} />

              <div>
                <span>Interests</span>

                <p>
                  {profile.interests?.length
                    ? profile.interests.join(", ")
                    : "No interests added"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetails;