 require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('public')); 
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("DB Connection Error: ", err));

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'member' }, // 'member' or 'admin'
    createdAt: { type: Date, default: Date.now }
},{ strict: false });

const User = mongoose.model('User', userSchema);

// 1. Registration Route (For Youth/Users)
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const newUser = new User({ fullName, email });
        await newUser.save();
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or invalid data." });
    }
});

// 2. Admin Login Route (Simple implementation)
app.post('/api/admin-login', async (req, res) => {
    const { username, password } = req.body;
    // NOTE: In production, use an Admin collection with hashed passwords
    if (username === 'admin' && password === 'RYV@2024') {
        res.json({ success: true, message: "Welcome Admin" });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials" });
    }
});

// 3. Get All Users Route (For Admin Panel)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

// 4. Delete User Route
app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
