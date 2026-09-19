import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const ProfileRequiredRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkProfile = async () => {
      try {
        const response = await api.get("/profile/me/status");

        if (mounted) {
          setProfileComplete(response.data.profileComplete === true);
        }
      } catch (error) {
        console.error("PROFILE STATUS ERROR:", error);

        if (mounted) {
          setProfileComplete(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <div className="loader" />
        <p>Checking your profile...</p>
      </div>
    );
  }

  if (!profileComplete) {
    return <Navigate to="/profile/setup" replace />;
  }

  return children;
};

export default ProfileRequiredRoute;
