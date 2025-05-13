import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddComplaint.css";

const AddComplaint = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/complaints",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      alert("Complaint submitted successfully");
      navigate("/userdashboard");
    } catch (error) {
      console.error("Error submitting complaint:", error);
    }
    setLoading(false);
  };

  return (
    <div className="add-complaint-container">
      <form onSubmit={handleSubmit} className="complaint-form">
        <h2>Submit a Complaint</h2>
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
          />
        </div>
        <div className="input-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue"
          ></textarea>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit Complaint"}
          
        </button>
        <button className="back2-btn" onClick={() => navigate("/UserDashboard")}>Back</button>
      </form>
      
      
    </div>
  );
};

export default AddComplaint;
