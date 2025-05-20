const userRepo = require("../repositories/user.repo");
const baseResponse = require("../utils/baseResponse.util");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json(baseResponse.error("All fields are required"));
    }

    // Check if the user already exists
    if (await userRepo.getUserByEmail(email)) {
        return res.status(409).json(baseResponse.error("Email already exists"));
    }

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userRepo.registerUser({ name, email, password: hashedPassword });
        return res.status(201).json(baseResponse.success("User registered successfully", newUser));
    } catch (error) {
        console.error("Error registering user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    // 1. Validasi input
    if (!email || !password) {
        return res.status(400).json(baseResponse.error("All fields are required"));
    }

    try {
        const user = await userRepo.getUserByEmail(email);
        if (!user) {
            // 2. Jangan beri tahu user tidak ada → tetap kirim pesan umum
            return res.status(401).json(baseResponse.error("Invalid email or password"));
        }

        // 3. Cocokkan password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json(baseResponse.error("Invalid email or password"));
        }

        // 4. Buat token JWT
        const token = jwt.sign(
            { userId: user.id }, // hanya kirim userId, aman dan cukup
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );        // 5. Simpan di cookie (httpOnly)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3600000 // 1 jam
        });

        // 6. Balas sukses tanpa perlu kirim token lagi (token already in cookie)
        // Return user info without password hash
        const { password_hash, ...userWithoutPassword } = user;
        return res.status(200).json(baseResponse.success("Login successful", { user: userWithoutPassword }));
    } catch (error) {
        console.error("Error logging in user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userRepo.getAllUsers();
        return res.status(200).json(baseResponse.success("Users fetched successfully", users));
    } catch (error) {
        console.error("Error fetching users", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userRepo.getUserById(id);
        if (!user) {
            return res.status(404).json(baseResponse.error("User not found"));
        }
        return res.status(200).json(baseResponse.success("User fetched successfully", user));
    } catch (error) {
        console.error("Error fetching user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json(baseResponse.error("All fields are required"));
    }

    try {
        const user = await userRepo.getUserById(id);
        if (!user) {
            return res.status(404).json(baseResponse.error("User not found"));
        }

        // Hash the new password before updating
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await userRepo.updateUser(id, { name, email, password: hashedPassword });
        return res.status(200).json(baseResponse.success("User updated successfully", updatedUser));
    } catch (error) {
        console.error("Error updating user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userRepo.getUserById(id);
        if (!user) {
            return res.status(404).json(baseResponse.error("User not found"));
        }

        await userRepo.deleteUser(id);
        return res.status(200).json(baseResponse.success("User deleted successfully"));
    } catch (error) {
        console.error("Error deleting user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.getProfile = async (req, res) => {
    console.log("User in request:", req.user);
    // Fix: Access userId property instead of id
    const userId = req.user.userId;

    try {
        console.log("Looking up user with ID:", userId);
        const user = await userRepo.getUserById(userId);
        console.log("User found:", user);

        if (!user) {
            return res.status(404).json(baseResponse.error("User not found"));
        }

        // Don't send password hash to client
        const { password_hash, ...userWithoutPassword } = user;

        return res.status(200).json(baseResponse.success("User profile fetched successfully", userWithoutPassword));
    } catch (error) {
        console.error("Error fetching user profile", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}

exports.logoutUser = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json(baseResponse.error("No token provided"));
    }

    try {
        // Clear the cookie
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json(baseResponse.success("Logout successful"));
    } catch (error) {
        console.error("Error logging out user", error);
        return res.status(500).json(baseResponse.error("Internal server error"));
    }
}