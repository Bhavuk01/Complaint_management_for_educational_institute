import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/admin/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(res.data);
    } catch (error) {
      console.error("Error fetching staff members:", error);
    }
  };

  const assignComplaint = async (complaintId, staffId) => {
    if (!staffId) {
      alert("Please select a staff member first.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/admin/assign",
        { complaintId, staffId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComplaints(); // refresh data
    } catch (error) {
      console.error("Error assigning complaint:", error);
    }
  };

  const formatComplaintId = (complaint) => {
    return `CMP-${complaint._id.slice(0, 3).toUpperCase()}-${complaint._id.slice(3, 6)}`;
  };

  if (loading) return <div className="admindashboard1">Loading...</div>;

  return (
    <div className="admindashboard1">
      <h1 className="admindashboard2">Admin Dashboard</h1>
      <div className="admindashboard3">
        <table className="admindashboard4">
          <thead>
            <tr className="admindashboard5">
              <th className="admindashboard6">Complaint ID</th>
              <th className="admindashboard6">Title</th>
              <th className="admindashboard6">Complaint By</th>
              <th className="admindashboard6">Status</th>
              <th className="admindashboard6">Assigned To</th>
              <th className="admindashboard6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint._id} className="admindashboard7">
                <td className="admindashboard8">{formatComplaintId(complaint)}</td>
                <td className="admindashboard8">{complaint.title}</td>
                <td className="admindashboard8">
                  {complaint.user ? complaint.user.name : "Unknown"}
                </td>
                <td className="admindashboard8">{complaint.status}</td>
                <td className="admindashboard8">
                  {complaint.assignedTo ? complaint.assignedTo.name : "Not Assigned"}
                </td>
                <td className="admindashboard8">
                  {complaint.assignedTo ? (
                    <span className="admindashboard9">In Working</span>
                  ) : (
                    <div className="admindashboard10">
                      <select
                        className="admindashboard11"
                        value={selectedStaff[complaint._id] || ""}
                        onChange={(e) =>
                          setSelectedStaff({
                            ...selectedStaff,
                            [complaint._id]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Staff</option>
                        {staff.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() =>
                          assignComplaint(complaint._id, selectedStaff[complaint._id])
                        }
                        className="admindashboard12"
                      >
                        Assign
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
