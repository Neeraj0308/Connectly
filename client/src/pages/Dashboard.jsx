import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome to Connectly ❤️</h1>

      <div style={{ marginTop: "30px" }}>
        <Link to="/discover">
          <button>Discover People</button>
        </Link>
      </div>

      <div style={{ marginTop: "15px" }}>
        <Link to="/matches">
          <button>My Matches ❤️</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
