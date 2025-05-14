import React, { useEffect, useState } from "react";
import axios from "axios";

const StaffDashboard = () => {
  const [staffName, setStaffName] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Fetch logged-in staff details
        const userRes = await axios.get("http://localhost:5000/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStaffName(userRes.data.name);

        // Fetch complaints assigned to the staff
        const complaintRes = await axios.get("http://localhost:5000/staff/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sortedComplaints = complaintRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  const updateComplaintStatus = async (complaintId) => {
    try {
      await axios.put(
        `http://localhost:5000/staff/complaints/${complaintId}`,
        { status: "Resolved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, status: "Resolved" } : complaint
        )
      );
    } catch (err) {
      console.error("Error updating status:", err.response?.data?.message || err.message);
    }
  };

  const resolveComplaint = async (complaintId) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/staff/resolve",
        { complaintId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId ? { ...complaint, status: "Resolved" } : complaint
        )
      );

      alert("Complaint marked as resolved!");
    } catch (err) {
      console.error("Error resolving complaint:", err);
      alert("An error occurred while resolving the complaint.");
    }
  };

  return (
    <div className="staff-dashboard">
      <h2>Welcome, {staffName} 👋</h2>
      <h3>Your Assigned Complaints</h3>

      {loading ? (
        <p>Loading...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints assigned to you yet.</p>
      ) : (
        <ul>
          {complaints.map((complaint) => (
            <div key={complaint._id} className="complaint-card">
              <h3><strong>Title:</strong> {complaint.title}</h3>
              <p><strong>Complaint ID:</strong> {formatComplaintId(complaint)}</p>
              <p><strong>Description:</strong> {complaint.description}</p>
              <span className={`status ${complaint.status.toLowerCase()}`}>{complaint.status}</span>

              {/* Display the name and email of the user who submitted the complaint */}
              <p><strong>Submitted by:</strong> {complaint.user ? `${complaint.user.name} (${complaint.user.email})` : "Unknown"}</p>
              
              {/* Display 'Resolved' after the 'Submitted by' when the status is resolved */}
              {complaint.status === "Resolved" && <p><strong>Status:</strong> Resolved</p>}
              
              {/* Move the button to the end */}
              <div className="resolve-btn-container">
                {complaint.status !== "Resolved" && (
                  <button onClick={() => resolveComplaint(complaint._id)} className="resolve-btn">
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffDashboard;
