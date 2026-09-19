import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  FileWarning,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("all");
  const [userPremium, setUserPremium] = useState("all");

  const [reportStatus, setReportStatus] = useState("all");

  const [userPage, setUserPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);

  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 1,
  });

  const [reportPagination, setReportPagination] = useState({
    page: 1,
    limit: 20,
    totalReports: 0,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    premiumUsers: 0,
    pendingReports: 0,
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: {
          search: userSearch,
          status: userStatus,
          premium: userPremium,
          page: userPage,
          limit: 20,
        },
      });

      const loadedUsers = response.data.users || [];

      setUsers(loadedUsers);

      setUserPagination(
        response.data.pagination || {
          page: userPage,
          limit: 20,
          totalUsers: loadedUsers.length,
          totalPages: 1,
        },
      );

      const statsResponse = await api.get("/admin/users", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const allUsers = statsResponse.data.users || [];

      setStats((previous) => ({
        ...previous,
        totalUsers:
          statsResponse.data.pagination?.totalUsers || allUsers.length,
        activeUsers: allUsers.filter((user) => user.isActive).length,
        inactiveUsers: allUsers.filter((user) => !user.isActive).length,
        premiumUsers: allUsers.filter((user) => user.isPremium).length,
      }));
    } catch (error) {
      console.error("ADMIN USERS ERROR:", error);

      setError(error.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setReportsLoading(true);

      const response = await api.get("/admin/reports", {
        params: {
          status: reportStatus,
          page: reportPage,
          limit: 20,
        },
      });

      const loadedReports = response.data.reports || [];

      setReports(loadedReports);

      setReportPagination(
        response.data.pagination || {
          page: reportPage,
          limit: 20,
          totalReports: loadedReports.length,
          totalPages: 1,
        },
      );

      if (reportStatus === "all") {
        const pendingResponse = await api.get("/admin/reports", {
          params: {
            status: "pending",
            page: 1,
            limit: 100,
          },
        });

        setStats((previous) => ({
          ...previous,
          pendingReports:
            pendingResponse.data.pagination?.totalReports ||
            pendingResponse.data.reports?.length ||
            0,
        }));
      }
    } catch (error) {
      console.error("ADMIN REPORTS ERROR:", error);

      setError(error.response?.data?.message || "Unable to load reports");
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [userSearch, userStatus, userPremium, userPage]);

  useEffect(() => {
    loadReports();
  }, [reportStatus, reportPage]);

  const refreshDashboard = async () => {
    await Promise.all([loadUsers(), loadReports()]);
  };

  const changeUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(userId);

      if (currentStatus) {
        await api.patch(`/admin/users/${userId}/deactivate`);
      } else {
        await api.patch(`/admin/users/${userId}/activate`);
      }

      await loadUsers();
    } catch (error) {
      console.error("ADMIN USER STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update user");
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

      await loadReports();
    } catch (error) {
      console.error("ADMIN REPORT STATUS ERROR:", error);

      setError(error.response?.data?.message || "Unable to update report");
    } finally {
      setActionLoading("");
    }
  };

  const resetUserFilters = () => {
    setUserSearch("");
    setUserStatus("all");
    setUserPremium("all");
    setUserPage(1);
  };

  const resetReportFilters = () => {
    setReportStatus("all");
    setReportPage(1);
  };

  const formatReason = (reason) => {
    if (!reason) return "Unknown";

    return reason
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading && users.length === 0) {
    return (
      <div className="page-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <span className="eyebrow">CONNECTLY ADMIN</span>

          <h1>Admin Dashboard</h1>

          <p>Manage users, reports and platform safety.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={refreshDashboard}
          disabled={loading || reportsLoading}
        >
          <RefreshCw
            size={17}
            className={loading || reportsLoading ? "admin-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <FileWarning size={18} />
          {error}
        </div>
      )}

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{stats.totalUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{stats.activeUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Crown size={22} />
          </div>

          <div>
            <span>Premium Users</span>
            <strong>{stats.premiumUsers}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FileWarning size={22} />
          </div>

          <div>
            <span>Pending Reports</span>
            <strong>{stats.pendingReports}</strong>
          </div>
        </div>
      </div>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">USER MANAGEMENT</span>

            <h2>Users</h2>
          </div>

          <span className="admin-result-count">
            {userPagination.totalUsers} users
          </span>
        </div>

        <div className="admin-filters">
          <div className="admin-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search name or email..."
              value={userSearch}
              onChange={(event) => {
                setUserSearch(event.target.value);
                setUserPage(1);
              }}
            />
          </div>

          <select
            value={userStatus}
            onChange={(event) => {
              setUserStatus(event.target.value);
              setUserPage(1);
            }}
          >
            <option value="all">All Status</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </select>

          <select
            value={userPremium}
            onChange={(event) => {
              setUserPremium(event.target.value);
              setUserPage(1);
            }}
          >
            <option value="all">All Accounts</option>

            <option value="premium">Premium</option>

            <option value="free">Free</option>
          </select>

          <button className="admin-filter-reset" onClick={resetUserFilters}>
            Reset
          </button>
        </div>

        {users.length === 0 ? (
          <div className="admin-empty">
            <Users size={40} />
            <p>No users found.</p>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Account</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-small-avatar">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <strong>{user.name}</strong>

                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {user.role === "admin" ? (
                          <span className="admin-role admin-role-admin">
                            Admin
                          </span>
                        ) : (
                          <span className="admin-role">User</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-status ${
                            user.isActive
                              ? "admin-status-active"
                              : "admin-status-inactive"
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck size={13} />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={13} />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td>
                        {user.isPremium ? (
                          <span className="admin-premium-status">
                            <Crown size={13} />
                            Premium
                          </span>
                        ) : (
                          <span className="admin-free-status">Free</span>
                        )}
                      </td>

                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>

                      <td>
                        <div className="admin-user-actions">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="admin-action-secondary"
                          >
                            <Eye size={14} />
                            View
                          </Link>

                          {user.role !== "admin" && (
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button
                disabled={userPage <= 1}
                onClick={() => setUserPage((page) => page - 1)}
              >
                Previous
              </button>

              <span>
                Page {userPagination.page} of {userPagination.totalPages}
              </span>

              <button
                disabled={userPage >= userPagination.totalPages}
                onClick={() => setUserPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <span className="eyebrow">SAFETY</span>

            <h2>Reports</h2>
          </div>

          <span className="admin-result-count">
            {reportPagination.totalReports} reports
          </span>
        </div>

        <div className="admin-filters">
          <select
            value={reportStatus}
            onChange={(event) => {
              setReportStatus(event.target.value);
              setReportPage(1);
            }}
          >
            <option value="all">All Reports</option>

            <option value="pending">Pending</option>

            <option value="reviewed">Reviewed</option>

            <option value="resolved">Resolved</option>

            <option value="dismissed">Dismissed</option>
          </select>

          <button className="admin-filter-reset" onClick={resetReportFilters}>
            Reset
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="admin-empty">
            <CheckCircle size={40} />
            <p>No reports found.</p>
          </div>
        ) : (
          <>
            <div className="admin-reports-list">
              {reports.map((report) => (
                <div className="admin-report-card" key={report._id}>
                  <div className="admin-report-card-top">
                    <div>
                      <span className="admin-report-icon">
                        <FileWarning size={18} />
                      </span>

                      <div>
                        <h3>
                          <Link
                            to={`/admin/reports/${report._id}`}
                            className="admin-report-link"
                          >
                            {formatReason(report.reason)}
                          </Link>
                        </h3>

                        <p>
                          Reported {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`admin-report-status admin-report-${report.status}`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="admin-report-users">
                    <div>
                      <span>Reporter</span>

                      <strong>{report.reporter?.name || "Unknown"}</strong>

                      <small>{report.reporter?.email || ""}</small>
                    </div>

                    <div>
                      <span>Reported User</span>

                      <strong>{report.reportedUser?.name || "Unknown"}</strong>

                      <small>{report.reportedUser?.email || ""}</small>
                    </div>
                  </div>

                  {report.description && (
                    <div className="admin-report-description">
                      {report.description}
                    </div>
                  )}

                  <div className="admin-report-actions">
                    <Link
                      to={`/admin/reports/${report._id}`}
                      className="admin-action-secondary"
                    >
                      <Eye size={15} />
                      View
                    </Link>

                    {report.status === "pending" && (
                      <button
                        className="admin-action-secondary"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "reviewed")
                        }
                      >
                        <Clock size={15} />
                        Review
                      </button>
                    )}

                    {report.status !== "resolved" && (
                      <button
                        className="admin-action-success"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "resolved")
                        }
                      >
                        <CheckCircle size={15} />
                        Resolve
                      </button>
                    )}

                    {report.status !== "dismissed" && (
                      <button
                        className="admin-action-danger"
                        disabled={actionLoading === report._id}
                        onClick={() =>
                          updateReportStatus(report._id, "dismissed")
                        }
                      >
                        <XCircle size={15} />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="admin-pagination">
              <button
                disabled={reportPage <= 1}
                onClick={() => setReportPage((page) => page - 1)}
              >
                Previous
              </button>

              <span>
                Page {reportPagination.page} of {reportPagination.totalPages}
              </span>

              <button
                disabled={reportPage >= reportPagination.totalPages}
                onClick={() => setReportPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
