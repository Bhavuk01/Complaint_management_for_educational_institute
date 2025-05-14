import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StaffDashboard.css";

const StaffDashboard = () => {
  const [staffName, setStaffName] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaffName(userRes.data.name);

        const complaintRes = await axios.get("http://localhost:5000/staff/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedComplaints = complaintRes.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sortedComplaints);
      } catch (err) {
        console.error("Error:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [token]);

  const formatComplaintId = (complaint) => {
    return `CMP-${complaint._id.slice(0, 3).toUpperCase()}-${complaint._id.slice(3, 6)}`;
  };

  const resolveComplaint = async (complaintId) => {
    try {
      await axios.post(
        "http://localhost:5000/staff/resolve",
        { complaintId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaintId ? { ...c, status: "Resolved" } : c
        )
      );

      alert("Complaint marked as resolved!");
    } catch (err) {
      console.error("Error resolving complaint:", err);
      alert("An error occurred while resolving the complaint.");
    }
  };

  return (
    <div className="staffdashboard1">
      <h2 className="staffdashboard2">Welcome, {staffName} 👋</h2>
      <h3 className="staffdashboard3">Your Assigned Complaints</h3>

      {loading ? (
        <p className="staffdashboard4">Loading...</p>
      ) : complaints.length === 0 ? (
        <p className="staffdashboard4">No complaints assigned to you yet.</p>
      ) : (
        <div className="staffdashboard5">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="staffdashboard6">
              <h3 className="staffdashboard7">{complaint.title}</h3>
              <p><strong>Complaint ID:</strong> {formatComplaintId(complaint)}</p>
              <p><strong>Description:</strong> {complaint.description}</p>
              <span className={`staffdashboard8 ${complaint.status.toLowerCase()}`}>
                {complaint.status}
              </span>
              <p>
                <strong>Submitted by:</strong>{" "}
                {complaint.user
                  ? `${complaint.user.name} (${complaint.user.email})`
                  : "Unknown"}
              </p>

              {complaint.status === "Resolved" && (
                <p><strong>Status:</strong> Resolved</p>
              )}

              {complaint.status !== "Resolved" && (
                <div className="staffdashboard9">
                  <button
                    onClick={() => resolveComplaint(complaint._id)}
                    className="staffdashboard10"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
