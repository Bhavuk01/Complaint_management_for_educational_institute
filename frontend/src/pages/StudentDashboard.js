// src/components/StudentDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/complaints", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComplaints(res.data);
      } catch (error) {
        console.error("Error fetching student complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div>
      <h2>🎓 Student Dashboard</h2>
      <h3>Your Complaints:</h3>
      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <ul>
          {complaints.map((complaint) => (
            <li key={complaint._id}>
              <strong>{complaint.title}</strong> - {complaint.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default StudentDashboard;
