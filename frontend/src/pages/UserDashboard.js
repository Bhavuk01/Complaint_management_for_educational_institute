import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";

const BACKEND_URL = "http://localhost:5000"; // Change if deployed

function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    setRole(userRole);

    // Fetch user info
    axios
      .get(`${BACKEND_URL}/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setUser(response.data))
      .catch(() => navigate("/userDashboard"));

    // Fetch complaints
    const endpoint = userRole === "admin" ? "/all-complaints" : "/complaints";
    axios
      .get(`${BACKEND_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => setComplaints(response.data))
      .catch((error) => console.error("Error fetching complaints:", error));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Welcome, {user?.name || "User"}!</h1>
      <p className="dashboard-subtitle">Manage your complaints efficiently.</p>

      {role !== "admin" && (
        <button className="add-complaint-btn" onClick={() => navigate("/addcomplaint")}>
          Add Complaint
        </button>
      )}

      <div className="complaints-section">
        <h2>{role === "admin" ? "All Complaints" : "Your Complaints"}</h2>
        {complaints.length === 0 ? (
          <p>No complaints available.</p>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <h3><strong>Title:</strong> {complaint.title}</h3>
                <p><strong>Complaint ID:</strong> {complaint._id}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <span className={`status ${complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </span>
                {role === "admin" && (
                  <p className="submitted-by"><strong>Submitted by:</strong> {complaint.userName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;
