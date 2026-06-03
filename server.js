require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public'))); 

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.log("DB Connection Error: ", err));

// SIMPLIFIED USER SCHEMA
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    memberType: { type: String, required: true }, // This is the "I want to join as" field
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);

// REGISTRATION ROUTE
app.post('/api/register', async (req, res) => {
    try {
        console.log("Data received:", req.body);

        // We only save the three fields we need
        const { fullName, email, memberType } = req.body;

        if (!fullName || !email || !memberType) {
            return res.status(400).json({ error: "Please fill in all required fields." });
        }

        const newUser = new User({ fullName, email, memberType });
        await newUser.save();
        
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        console.error("Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email is already registered." });
        }
        res.status(400).json({ error: "Registration failed: " + err.message });
    }
});

// Admin Login Route
app.post('/api/admin-login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'RYV@2024') {
        res.json({ success: true, message: "Welcome Admin" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// Get All Users Route
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

// Delete User Route
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting user" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
