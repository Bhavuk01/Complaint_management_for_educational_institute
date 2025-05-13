require("dotenv").config(); // Load .env variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ User Schema


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "staff"], default: "user" } // ✅ Added role
});


const User = mongoose.model("User", UserSchema);
module.exports = User;


// ✅ Complaint Schema
const ComplaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Pending" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  createdAt: { type: Date, default: Date.now }
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);
module.exports = Complaint;



// ✅ Middleware to Verify JWT Token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ JWT Verification Error:", err);
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// ✅ Register API
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Login API (Fixed JWT Secret Issue)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 🔥 FIXED: Use process.env.JWT_SECRET
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, role: user.role });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Submit a Complaint (POST)
app.post("/complaints", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }

    const newComplaint = new Complaint({
      user: req.user.id,
      title,
      description,
      status: "Pending",
    });

    await newComplaint.save();
    res.status(201).json({ 
      message: "Complaint submitted successfully", 
      complaint: newComplaint,
      redirect: "/userdashboard" // Send redirect path
    });
  } catch (error) {
    console.error("❌ Error submitting complaint:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ✅ Get Complaints of Logged-in User (GET)
app.get("/complaints", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .populate("user", "name email") // Fetch user name & email
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


// ✅ Get Logged-in User Details
app.get("/user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user details:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get("/admin/complaints", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email") // Ensure this fetches user details
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});







app.post("/admin/assign", authMiddleware, async (req, res) => {
  const { complaintId, staffId } = req.body;

  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") return res.status(400).json({ message: "Invalid staff member" });

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.assignedTo = staffId;
    complaint.status = "Assigned";
    await complaint.save();

    res.json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error assigning complaint", error: error.message });
  }
});

app.get("/staff", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    const staffMembers = await User.find({ role: "staff" }).select("-password");
    res.json(staffMembers);
  } catch (error) {
    console.error("❌ Error fetching staff members:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


app.get("/staff/complaints", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "staff") return res.status(403).json({ message: "Access denied" });

    const complaints = await Complaint.find({ assignedTo: req.user.id }).populate("user", "name email");
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned complaints", error: error.message });
  }
});



app.post("/staff/resolve", authMiddleware, async (req, res) => {
  const { complaintId } = req.body;

  try {
    if (req.user.role !== "staff") return res.status(403).json({ message: "Access denied" });

    const complaint = await Complaint.findOne({ _id: complaintId, assignedTo: req.user.id });
    if (!complaint) return res.status(404).json({ message: "Complaint not found or not assigned to you" });

    complaint.status = "Resolved";
    await complaint.save();

    res.json({ message: "Complaint resolved successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error resolving complaint", error: error.message });
  }
});




// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


