import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bell,
  Check,
  Trash2,
  UserRound,
} from "lucide-react";
import api from "../api/axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((current) =>
        current.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);
    }
  };

  const getIcon = (type) => {
    if (type === "like") {
      return <Heart size={20} />;
    }

    if (type === "match") {
      return <Heart size={20} />;
    }

    if (type === "message") {
      return <MessageCircle size={20} />;
    }

    return <Bell size={20} />;
  };

  const getNotificationLink = (notification) => {
    if (notification.type === "match" && notification.matchId) {
      return `/chat/${notification.matchId}`;
    }

    if (notification.type === "message" && notification.matchId) {
      return `/chat/${notification.matchId}`;
    }

    return null;
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <span className="eyebrow">UPDATES</span>

          <h1>
            Notifications
            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount}
              </span>
            )}
          </h1>

          <p>Stay updated on your Connectly activity.</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            <Check size={17} />

            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-notifications">
          <div className="empty-notification-icon">
            <Bell size={32} />
          </div>

          <h2>No notifications yet</h2>

          <p>
            When someone likes you or you get a match,
            you'll see it here.
          </p>

          <Link to="/discover" className="primary-button">
            Discover people
          </Link>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);

            const notificationContent = (
              <div
                className={`notification-card ${
                  !notification.isRead ? "unread" : ""
                }`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification._id);
                  }
                }}
              >
                <div className={`notification-icon ${notification.type}`}>
                  {getIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <h3>{notification.title}</h3>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </span>
                </div>

                {!notification.isRead && (
                  <div className="unread-dot" />
                )}

                <button
                  className="delete-notification"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  title="Delete notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );

            if (link) {
              return (
                <Link
                  to={link}
                  key={notification._id}
                  className="notification-link"
                >
                  {notificationContent}
                </Link>
              );
            }

            return (
              <div key={notification._id}>
                {notificationContent}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;