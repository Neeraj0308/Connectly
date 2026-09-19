import { useEffect, useState } from "react";
import {
  Users,
  Flag,
  UserCheck,
  UserX,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResponse, reportsResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/reports"),
      ]);

      setUsers(usersResponse.data.users || []);
      setReports(reportsResponse.data.reports || []);
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);

      setError(
        error.response?.data?.message || "Unable to load admin dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const changeUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(userId);

      if (isActive) {
        await api.patch(`/admin/users/${userId}/deactivate`);
      } else {
        await api.patch(`/admin/users/${userId}/activate`);
      }

      await loadDashboard();
    } catch (error) {
      console.error("USER STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update user status");
    } finally {
      setActionLoading("");
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      setActionLoading(reportId);

      await api.patch(`/admin/reports/${reportId}/status`, {
        status,
      });

      await loadDashboard();
    } catch (error) {
      console.error("REPORT STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update report");
    } finally {
      setActionLoading("");
    }
  };

  const totalUsers = users.length;

  const activeUsers = users.filter((user) => user.isActive).length;

  const inactiveUsers = users.filter((user) => !user.isActive).length;

  const pendingReports = reports.filter(
    (report) => report.status === "pending",
  ).length;

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="eyebrow">CONNECTLY ADMIN</span>
          <h1>Admin Dashboard</h1>
          <p>Manage users, reports and platform safety.</p>
        </div>

        <button className="admin-refresh-button" onClick={loadDashboard}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <ShieldAlert size={18} />
          {error}
        </div>
      )}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserX size={22} />
          </div>

          <div>
            <span>Inactive Users</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Flag size={22} />
          </div>

          <div>
            <span>Pending Reports</span>
            <strong>{pendingReports}</strong>
          </div>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">USER MANAGEMENT</span>
            <h2>Users</h2>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="admin-empty">
            <Users size={35} />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Premium</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span
                        className={`admin-role ${
                          user.role === "admin" ? "admin-role-admin" : ""
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status ${
                          user.isActive
                            ? "admin-status-active"
                            : "admin-status-inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>{user.isPremium ? "Premium" : "Free"}</td>

                    <td>
                      {user.role === "admin" ? (
                        <span className="admin-protected">Protected</span>
                      ) : (
                        <button
                          className={
                            user.isActive
                              ? "admin-action-danger"
                              : "admin-action-success"
                          }
                          disabled={actionLoading === user._id}
                          onClick={() =>
                            changeUserStatus(user._id, user.isActive)
                          }
                        >
                          {actionLoading === user._id
                            ? "Updating..."
                            : user.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">SAFETY</span>
            <h2>Reports</h2>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="admin-empty">
            <Flag size={35} />
            <p>No reports found.</p>
          </div>
        ) : (
          <div className="admin-reports">
            {reports.map((report) => (
              <div className="admin-report-card" key={report._id}>
                <div className="admin-report-main">
                  <div className="admin-report-icon">
                    <Flag size={20} />
                  </div>

                  <div>
                    <h3>
                      {report.reason
                        ?.replaceAll("_", " ")
                        ?.replace(/\b\w/g, (char) => char.toUpperCase())}
                    </h3>

                    <p>
                      <strong>{report.reporter?.name || "Unknown user"}</strong>{" "}
                      reported{" "}
                      <strong>
                        {report.reportedUser?.name || "Unknown user"}
                      </strong>
                    </p>

                    {report.description && (
                      <p className="admin-report-description">
                        {report.description}
                      </p>
                    )}

                    <span className="admin-report-date">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="admin-report-actions">
                  <span
                    className={`admin-report-status admin-report-${report.status}`}
                  >
                    {report.status}
                  </span>

                  {report.status === "pending" && (
                    <>
                      <button
                        className="admin-action-secondary"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "reviewed")
                        }
                      >
                        Review
                      </button>

                      <button
                        className="admin-action-success"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "resolved")
                        }
                      >
                        Resolve
                      </button>

                      <button
                        className="admin-action-danger"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "dismissed")
                        }
                      >
                        Dismiss
                      </button>
                    </>
                  )}

                  {report.status === "reviewed" && (
                    <>
                      <button
                        className="admin-action-success"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "resolved")
                        }
                      >
                        Resolve
                      </button>

                      <button
                        className="admin-action-danger"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "dismissed")
                        }
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
