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
        setComplaints(complaintRes.data);
      } catch (err) {
        console.error("Error:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [token]);

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
          {complaints.map((comp) => (
            <li key={comp._id} className="complaint-card">
              <h4><strong>Title:</strong> {comp.title}</h4>
              <p><strong>Complaint ID:</strong> {comp._id}</p>
              <p><strong>Description:</strong> {comp.description}</p>
              <p><strong>Status:</strong> {comp.status}</p>
              <p><strong>Submitted by:</strong> {comp.user.name} ({comp.user.email})</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StaffDashboard;
