require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.log("❌ DB Connection Error: ", err));

// SIMPLIFIED SCHEMA
const userSchema = new mongoose.Schema({
    fullName: String, 
    email: { type: String, unique: true }, 
    memberType: String,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    try {
        console.log("📩 Attempting to register:", req.body);
        
        // Create user using the body sent from HTML
        const newUser = new User(req.body); 
        await newUser.save();
        
        console.log("🚀 User saved successfully!");
        res.status(201).json({ message: "Registration Successful!" });
    } catch (err) {
        console.error("⚠️ Registration Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "This email is already registered." });
        }
        res.status(400).json({ error: "Server Error: " + err.message });
    }
});

// Admin routes...
app.post('/api/admin-login', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'RYV@2024') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Invalid Credentials" });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
