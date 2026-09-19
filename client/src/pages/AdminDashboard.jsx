import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  Users,
  UserCheck,
  Crown,
  AlertTriangle,
  Heart,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
  RefreshCw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    users: {
      total: 0,
      active: 0,
      inactive: 0,
      premium: 0,
      free: 0,
    },
    engagement: {
      matches: 0,
      likes: 0,
      messages: 0,
    },
    safety: {
      totalReports: 0,
      pendingReports: 0,
    },
    growth: {
      newUsers7Days: 0,
      newUsers30Days: 0,
    },
  });

  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("all");
  const [userPremium, setUserPremium] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    totalPages: 1,
    totalUsers: 0,
  });

  const [reportStatus, setReportStatus] = useState("all");
  const [reportPage, setReportPage] = useState(1);
  const [reportPagination, setReportPagination] = useState({
    page: 1,
    totalPages: 1,
    totalReports: 0,
  });

  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const loadAnalytics = async () => {
    try {
      setLoadingAnalytics(true);

      const response = await api.get("/admin/analytics");

      setAnalytics(response.data.analytics || analytics);
    } catch (error) {
      console.error("LOAD ANALYTICS ERROR:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const userDistributionData = [
    {
      name: "Active",
      value: analytics.users.active,
    },
    {
      name: "Inactive",
      value: analytics.users.inactive,
    },
  ];

  const planDistributionData = [
    {
      name: "Premium",
      value: analytics.users.premium,
    },
    {
      name: "Free",
      value: analytics.users.free,
    },
  ];

  const engagementData = [
    {
      name: "Likes",
      value: analytics.engagement.likes,
    },
    {
      name: "Matches",
      value: analytics.engagement.matches,
    },
    {
      name: "Messages",
      value: analytics.engagement.messages,
    },
  ];

  const growthData = [
    {
      period: "Last 7 Days",
      users: analytics.growth.newUsers7Days,
    },
    {
      period: "Last 30 Days",
      users: analytics.growth.newUsers30Days,
    },
  ];

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await api.get("/admin/users", {
        params: {
          search: userSearch,
          status: userStatus,
          premium: userPremium,
          page: userPage,
          limit: 10,
        },
      });

      setUsers(response.data.users || []);
      setUserPagination(
        response.data.pagination || {
          page: 1,
          totalPages: 1,
          totalUsers: 0,
        },
      );
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadReports = async () => {
    try {
      setLoadingReports(true);

      const response = await api.get("/admin/reports", {
        params: {
          status: reportStatus,
          page: reportPage,
          limit: 10,
        },
      });

      setReports(response.data.reports || []);
      setReportPagination(
        response.data.pagination || {
          page: 1,
          totalPages: 1,
          totalReports: 0,
        },
      );
    } catch (error) {
      console.error("LOAD REPORTS ERROR:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userSearch, userStatus, userPremium, userPage]);

  useEffect(() => {
    loadReports();
  }, [reportStatus, reportPage]);

  const refreshDashboard = async () => {
    await Promise.all([loadAnalytics(), loadUsers(), loadReports()]);
  };

  const resetUserFilters = () => {
    setUserSearch("");
    setUserStatus("all");
    setUserPremium("all");
    setUserPage(1);
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      setActionLoading(`user-${userId}`);

      await api.patch(`/admin/users/${userId}/status`, {
        isActive,
      });

      await Promise.all([loadUsers(), loadAnalytics()]);
    } catch (error) {
      console.error("UPDATE USER STATUS ERROR:", error);
      alert(error.response?.data?.message || "Unable to update user status");
    } finally {
      setActionLoading("");
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      setActionLoading(`report-${reportId}`);

      await api.patch(`/admin/reports/${reportId}/status`, {
        status,
      });

      await Promise.all([loadReports(), loadAnalytics()]);
    } catch (error) {
      console.error("UPDATE REPORT STATUS ERROR:", error);
      alert(error.response?.data?.message || "Unable to update report status");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <span className="eyebrow">ADMIN PANEL</span>
          <h1>Dashboard</h1>
          <p>Manage users, reports, safety and platform activity.</p>
        </div>

        <button className="admin-refresh-button" onClick={refreshDashboard}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={22} />
          </div>
          <div>
            <span>Total Users</span>
            <strong>{loadingAnalytics ? "..." : analytics.users.total}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <UserCheck size={22} />
          </div>
          <div>
            <span>Active Users</span>
            <strong>{loadingAnalytics ? "..." : analytics.users.active}</strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Crown size={22} />
          </div>
          <div>
            <span>Premium Users</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.users.premium}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span>Pending Reports</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.safety.pendingReports}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Heart size={22} />
          </div>
          <div>
            <span>Active Matches</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.engagement.matches}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <ThumbsUp size={22} />
          </div>
          <div>
            <span>Total Likes</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.engagement.likes}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <MessageCircle size={22} />
          </div>
          <div>
            <span>Total Messages</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.engagement.messages}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>New Users · 7 Days</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.growth.newUsers7Days}
            </strong>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <TrendingUp size={22} />
          </div>
          <div>
            <span>New Users · 30 Days</span>
            <strong>
              {loadingAnalytics ? "..." : analytics.growth.newUsers30Days}
            </strong>
          </div>
        </div>
      </section>

      <section className="admin-growth-panel">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">PLATFORM OVERVIEW</span>
            <h2>Growth & Engagement</h2>
          </div>
        </div>

        <div className="admin-growth-grid">
          <div className="admin-growth-item">
            <span>Active Users</span>
            <strong>{analytics.users.active}</strong>
            <small>
              {analytics.users.total > 0
                ? `${Math.round(
                    (analytics.users.active / analytics.users.total) * 100,
                  )}% of all users`
                : "0% of all users"}
            </small>
          </div>

          <div className="admin-growth-item">
            <span>Premium Users</span>
            <strong>{analytics.users.premium}</strong>
            <small>
              {analytics.users.total > 0
                ? `${Math.round(
                    (analytics.users.premium / analytics.users.total) * 100,
                  )}% of all users`
                : "0% of all users"}
            </small>
          </div>

          <div className="admin-growth-item">
            <span>7-Day Growth</span>
            <strong>{analytics.growth.newUsers7Days}</strong>
            <small>New registrations</small>
          </div>

          <div className="admin-growth-item">
            <span>30-Day Growth</span>
            <strong>{analytics.growth.newUsers30Days}</strong>
            <small>New registrations</small>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
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
              placeholder="Search by name or email"
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
            <option value="all">All Plans</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>

          <button className="admin-reset-button" onClick={resetUserFilters}>
            Reset
          </button>
        </div>

        {loadingUsers ? (
          <div className="admin-loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Gender</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`admin-status ${
                          user.isActive ? "active" : "inactive"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-plan ${
                          user.isPremium ? "premium" : "free"
                        }`}
                      >
                        {user.isPremium ? "Premium" : "Free"}
                      </span>
                    </td>

                    <td>{user.gender || "—"}</td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <div className="admin-actions">
                        <Link
                          to={`/admin/users/${user._id}`}
                          className="admin-icon-button"
                          title="View user"
                        >
                          <Eye size={17} />
                        </Link>

                        {user.isActive ? (
                          <button
                            className="admin-icon-button danger"
                            title="Deactivate user"
                            disabled={actionLoading === `user-${user._id}`}
                            onClick={() => updateUserStatus(user._id, false)}
                          >
                            <XCircle size={17} />
                          </button>
                        ) : (
                          <button
                            className="admin-icon-button success"
                            title="Activate user"
                            disabled={actionLoading === `user-${user._id}`}
                            onClick={() => updateUserStatus(user._id, true)}
                          >
                            <CheckCircle size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {userPagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              disabled={userPage <= 1}
              onClick={() => setUserPage((page) => Math.max(page - 1, 1))}
            >
              Previous
            </button>

            <span>
              Page {userPagination.page} of {userPagination.totalPages}
            </span>

            <button
              disabled={userPage >= userPagination.totalPages}
              onClick={() =>
                setUserPage((page) =>
                  Math.min(page + 1, userPagination.totalPages),
                )
              }
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading">
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
        </div>

        {loadingReports ? (
          <div className="admin-loading">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="admin-empty">No reports found.</div>
        ) : (
          <div className="admin-reports-list">
            {reports.map((report) => (
              <div className="admin-report-card" key={report._id}>
                <div className="admin-report-main">
                  <div className="admin-report-icon">
                    <AlertTriangle size={20} />
                  </div>

                  <div>
                    <h3>{report.reportedUser?.name || "Unknown user"}</h3>

                    <p>Reported by {report.reporter?.name || "Unknown user"}</p>

                    <span className="admin-report-reason">
                      {report.reason?.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="admin-report-meta">
                  <span className={`admin-report-status ${report.status}`}>
                    {report.status}
                  </span>

                  <small>{formatDate(report.createdAt)}</small>

                  <div className="admin-report-actions">
                    <Link
                      to={`/admin/reports/${report._id}`}
                      className="admin-view-button"
                    >
                      <Eye size={16} />
                      View
                    </Link>

                    {report.status === "pending" && (
                      <>
                        <button
                          className="admin-review-button"
                          disabled={actionLoading === `report-${report._id}`}
                          onClick={() =>
                            updateReportStatus(report._id, "reviewed")
                          }
                        >
                          <Clock size={15} />
                          Review
                        </button>

                        <button
                          className="admin-resolve-button"
                          disabled={actionLoading === `report-${report._id}`}
                          onClick={() =>
                            updateReportStatus(report._id, "resolved")
                          }
                        >
                          <CheckCircle size={15} />
                          Resolve
                        </button>
                      </>
                    )}

                    {report.status === "reviewed" && (
                      <button
                        className="admin-resolve-button"
                        disabled={actionLoading === `report-${report._id}`}
                        onClick={() =>
                          updateReportStatus(report._id, "resolved")
                        }
                      >
                        <CheckCircle size={15} />
                        Resolve
                      </button>
                    )}

                    {(report.status === "pending" ||
                      report.status === "reviewed") && (
                      <button
                        className="admin-dismiss-button"
                        disabled={actionLoading === `report-${report._id}`}
                        onClick={() =>
                          updateReportStatus(report._id, "dismissed")
                        }
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {reportPagination.totalPages > 1 && (
          <div className="admin-pagination">
            <button
              disabled={reportPage <= 1}
              onClick={() => setReportPage((page) => Math.max(page - 1, 1))}
            >
              Previous
            </button>

            <span>
              Page {reportPagination.page} of {reportPagination.totalPages}
            </span>

            <button
              disabled={reportPage >= reportPagination.totalPages}
              onClick={() =>
                setReportPage((page) =>
                  Math.min(page + 1, reportPagination.totalPages),
                )
              }
            >
              Next
            </button>
          </div>
        )}
      </section>

      <section className="admin-charts-grid">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <span className="eyebrow">USER STATUS</span>
              <h2>Active vs Inactive</h2>
            </div>
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  label
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`user-cell-${index}`} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <div>
              <span className="eyebrow">SUBSCRIPTIONS</span>
              <h2>Premium vs Free</h2>
            </div>
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={planDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={4}
                  label
                >
                  {planDistributionData.map((entry, index) => (
                    <Cell key={`plan-cell-${index}`} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-card admin-chart-wide">
          <div className="admin-chart-header">
            <div>
              <span className="eyebrow">ENGAGEMENT</span>
              <h2>Platform Activity</h2>
            </div>
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-chart-card admin-chart-wide">
          <div className="admin-chart-header">
            <div>
              <span className="eyebrow">GROWTH</span>
              <h2>New User Registrations</h2>
            </div>
          </div>

          <div className="admin-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="users" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
