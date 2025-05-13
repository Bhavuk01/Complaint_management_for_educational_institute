import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AddComplaint from "./pages/AddComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userdashboard" element={<UserDashboard />} />
        <Route path="/addcomplaint" element={<AddComplaint />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;