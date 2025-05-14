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

  const formatComplaintId = (complaint) => {
    return `CMP-${complaint._id.slice(0, 3).toUpperCase()}-${complaint._id.slice(3, 6)}`;
  };

  const deleteComplaint = (complaintId) => {
    const token = localStorage.getItem("token");

    axios
      .delete(`${BACKEND_URL}/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setComplaints(complaints.filter((complaint) => complaint._id !== complaintId));
        alert("Complaint deleted successfully.");
      })
      .catch((error) => console.error("Error deleting complaint:", error));
  };

  return (
    <div className="userdashboard-container">
      <h1 className="userdashboard-title">Welcome, {user?.name || "User"}!</h1>
      <p className="userdashboard-subtitle">Manage your complaints efficiently.</p>

      {role !== "admin" && (
        <button className="useradd-complaint-btn" onClick={() => navigate("/addcomplaint")}>
          Add Complaint
        </button>
      )}

      <div className="usercomplaints-section">
        <h2>{role === "admin" ? "All Complaints" : "Your Complaints"}</h2>
        {complaints.length === 0 ? (
          <p>No complaints available.</p>
        ) : (
          <div className="usercomplaints-list">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="usercomplaint-card">
                <h3><strong>Title:</strong> {complaint.title}</h3>
                <p><strong>Complaint ID:</strong> {formatComplaintId(complaint)}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <span className={`status ${complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </span>
                {role === "admin" && (
                  <p className="usersubmitted-by"><strong>Submitted by:</strong> {complaint.userName}</p>
                )}
                {role !== "admin" && (
                  <button
                    className="userdelete-complaint-btn"
                    onClick={() => deleteComplaint(complaint._id)}
                  >
                    Delete Complaint
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="userlogout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default UserDashboard;
