import db from "../configs/db.js";
import bcrypt from "bcrypt";

async function getUsers(req, res) {
    try {
        const users = [];
        const usersRef = db.collection("users");
        const snapshot = await usersRef.get();
        snapshot.forEach((doc) => {
            users.push({ _id: doc.id, ...doc.data() });
        });
        res.status(200).json({
            status: "success",
            data: users
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function createUsers(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const created = new Date().toISOString();
        const updated = created;
        const user = { 
            firstName: firstName,
            lastName: lastName, 
            email: email,
            password: hashedPassword,
            createdAt: created,
            updatedAt: updated
        };

        await db.collection("users").doc().set(user);
        res.status(201).json({ 
            status: "success",
            message: "User created successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function getUserById(req, res) {
    try {
        const { docId } = req.params;
        const user = await db.collection("users").doc(docId).get();
        if (!user.exists) {
            res.status(404).json({ 
                status: "error",
                error: "User not found" 
            });
        } else {
            res.status(200).json(user.data());
        }
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function editUserById(req, res) {
    try {
        const { docId } = req.params;
        const { firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const updated = new Date().toISOString();
        const user = { 
            firstName: firstName,
            lastName: lastName, 
            email: email,
            password: hashedPassword,
            updatedAt: updated
        };

        await db.collection("users").doc(docId).update(user);
        res.status(200).json({ 
            status: "success",
            message: "User updated successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function deleteUserById(req, res) {
    try {
        const { docId } = req.params;
        await db.collection("users").doc(docId).delete();
        res.status(200).json({ 
            status: "success",
            message: "User deleted successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

export default { 
    getUsers, 
    createUsers, 
    getUserById, 
    editUserById, 
    deleteUserById 
};