import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Flag,
  User,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  UserX,
  UserCheck,
} from "lucide-react";
import api from "../api/axios";

const AdminReportDetails = () => {
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [reportedProfile, setReportedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/reports/${reportId}`);

      setReport(response.data.report);

      const reportedUserId = response.data.report?.reportedUser?._id;

      if (reportedUserId) {
        try {
          const userResponse = await api.get(`/admin/users/${reportedUserId}`);

          setReportedProfile({
            user: userResponse.data.user,
            profile: userResponse.data.profile,
          });
        } catch (profileError) {
          console.error("LOAD REPORTED USER ERROR:", profileError);
        }
      }
    } catch (error) {
      console.error("ADMIN REPORT DETAILS ERROR:", error);

      setError(error.response?.data?.message || "Unable to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const updateStatus = async (status) => {
    try {
      setActionLoading(status);

      await api.patch(`/admin/reports/${reportId}/status`, {
        status,
      });

      await loadReport();
    } catch (error) {
      console.error("REPORT STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update report");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!reportedProfile?.user) return;

    try {
      setActionLoading("user");

      const user = reportedProfile.user;

      if (user.isActive) {
        await api.patch(`/admin/users/${user._id}/deactivate`);
      } else {
        await api.patch(`/admin/users/${user._id}/activate`);
      }

      await loadReport();
    } catch (error) {
      console.error("REPORTED USER STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="page-center">
        <p>{error || "Report not found"}</p>

        <Link to="/admin" className="primary-button">
          Back to Admin
        </Link>
      </div>
    );
  }

  const reportedUser = reportedProfile?.user;
  const profile = reportedProfile?.profile;

  const formattedReason = report.reason
    ?.replaceAll("_", " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="admin-report-page">
      <div className="admin-user-topbar">
        <Link to="/admin" className="admin-back-button">
          <ArrowLeft size={18} />
          Back to Admin
        </Link>
      </div>

      <div className="admin-report-header-card">
        <div className="admin-report-header-icon">
          <Flag size={28} />
        </div>

        <div className="admin-report-header-content">
          <span className="eyebrow">SAFETY REPORT</span>

          <h1>{formattedReason}</h1>

          <p>Submitted {new Date(report.createdAt).toLocaleString()}</p>
        </div>

        <span className={`admin-report-status admin-report-${report.status}`}>
          {report.status}
        </span>
      </div>

      <div className="admin-report-grid">
        <section className="admin-user-profile-card">
          <div className="admin-section-header">
            <div>
              <span className="eyebrow">REPORTER</span>

              <h2>Reported By</h2>
            </div>
          </div>

          <div className="admin-report-person">
            <div className="admin-large-avatar">
              {report.reporter?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h3>{report.reporter?.name || "Unknown user"}</h3>

              <p>{report.reporter?.email || "No email available"}</p>

              <span
                className={`admin-status ${
                  report.reporter?.isActive
                    ? "admin-status-active"
                    : "admin-status-inactive"
                }`}
              >
                {report.reporter?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </section>

        <section className="admin-user-profile-card">
          <div className="admin-section-header">
            <div>
              <span className="eyebrow">REPORTED USER</span>

              <h2>Reported Account</h2>
            </div>
          </div>

          {reportedUser ? (
            <>
              <div className="admin-report-person">
                <div className="admin-large-avatar">
                  {reportedUser.name?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <h3>{reportedUser.name}</h3>

                  <p>{reportedUser.email}</p>

                  <div className="admin-user-status-row">
                    <span
                      className={`admin-status ${
                        reportedUser.isActive
                          ? "admin-status-active"
                          : "admin-status-inactive"
                      }`}
                    >
                      {reportedUser.isActive ? "Active" : "Inactive"}
                    </span>

                    {reportedUser.isPremium && (
                      <span className="admin-premium-status">Premium</span>
                    )}
                  </div>
                </div>
              </div>

              {reportedUser.role !== "admin" && (
                <button
                  className={
                    reportedUser.isActive
                      ? "admin-action-danger"
                      : "admin-action-success"
                  }
                  disabled={actionLoading === "user"}
                  onClick={toggleUserStatus}
                >
                  {actionLoading === "user" ? (
                    "Updating..."
                  ) : reportedUser.isActive ? (
                    <>
                      <UserX size={15} />
                      Deactivate Account
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} />
                      Activate Account
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <p>Reported user information unavailable.</p>
          )}
        </section>
      </div>

      <section className="admin-user-profile-card">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">REPORT INFORMATION</span>

            <h2>Report Details</h2>
          </div>
        </div>

        <div className="admin-report-detail-box">
          <div>
            <span>Reason</span>
            <strong>{formattedReason}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong>{report.status}</strong>
          </div>

          <div>
            <span>Report ID</span>
            <strong>{report._id}</strong>
          </div>
        </div>

        <div className="admin-report-description-box">
          <span>Description</span>

          <p>
            {report.description || "No additional description was provided."}
          </p>
        </div>
      </section>

      {profile && (
        <section className="admin-user-profile-card">
          <div className="admin-section-header">
            <div>
              <span className="eyebrow">REPORTED PROFILE</span>

              <h2>Profile Information</h2>
            </div>
          </div>

          <div className="admin-profile-details">
            <div className="admin-profile-detail">
              <Heart size={18} />

              <div>
                <span>Bio</span>

                <p>{profile.bio || "No bio provided"}</p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <MapPin size={18} />

              <div>
                <span>City</span>

                <p>{profile.city || "Not provided"}</p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <Briefcase size={18} />

              <div>
                <span>Profession</span>

                <p>{profile.profession || "Not provided"}</p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <GraduationCap size={18} />

              <div>
                <span>Education</span>

                <p>{profile.education || "Not provided"}</p>
              </div>
            </div>

            <div className="admin-profile-detail">
              <Heart size={18} />

              <div>
                <span>Relationship Goal</span>

                <p>{profile.relationshipGoal || "Not provided"}</p>
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
        </section>
      )}

      <section className="admin-user-profile-card">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">MODERATION</span>

            <h2>Report Action</h2>
          </div>
        </div>

        <div className="admin-moderation-actions">
          {report.status === "pending" && (
            <button
              className="admin-action-secondary"
              disabled={actionLoading === "reviewed"}
              onClick={() => updateStatus("reviewed")}
            >
              <ShieldCheck size={16} />
              Mark Reviewed
            </button>
          )}

          {report.status !== "resolved" && (
            <button
              className="admin-action-success"
              disabled={actionLoading === "resolved"}
              onClick={() => updateStatus("resolved")}
            >
              <ShieldCheck size={16} />
              Resolve Report
            </button>
          )}

          {report.status !== "dismissed" && (
            <button
              className="admin-action-danger"
              disabled={actionLoading === "dismissed"}
              onClick={() => updateStatus("dismissed")}
            >
              <ShieldAlert size={16} />
              Dismiss Report
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminReportDetails;
