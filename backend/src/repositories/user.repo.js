const db = require("../database/pg.database");

exports.registerUser = async (users) => {
    const { name, email, password } = users;
    try {
        const result = await db.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error registering user", error);
        throw error;
    }
}

exports.loginUser = async (email, password) => {
    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1 AND password_hash = $2",
            [email, password]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error logging in user", error);
        throw error;
    }
}

exports.deleteUser = async (id) => {
    try {
        const result = await db.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error deleting user", error);
        throw error;
    }
}

exports.updateUser = async (id, user) => {
    const { name, email, password } = user;
    try {
        const result = await db.query(
            "UPDATE users SET name = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING *",
            [name, email, password, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating user", error);
        throw error;
    }
}

exports.getAllUsers = async () => {
    try {
        const result = await db.query("SELECT * FROM users");
        return result.rows;
    } catch (error) {
        console.error("Error fetching users", error);
        throw error;
    }
}

exports.getUserById = async (id) => {
    try {
        console.log("Repository - getting user with ID:", id);
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        console.log("Repository - query result:", result.rows);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching user by ID", error);
        throw error;
    }
}

exports.getUserByEmail = async (email) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching user by email", error);
        throw error;
    }
}

exports.getUserByUsername = async (username) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
        return result.rows[0];
    } catch (error) {
        console.error("Error fetching user by username", error);
        throw error;
    }
}
