import db from "../configs/db.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function login(req, res){
    try {
        const { email, password } = req.body;
        const user = await db.collection("users").where("email", "==", email).get();
        if (user.empty) {
            res.status(404).json({ 
                status: "error",
                error: "User not found" 
            });
        } else {
            user.forEach(async (doc) => {
                const user = doc.data();
                const isPasswordMatch = await bcrypt.compare(password, user.password);
                if (isPasswordMatch) {
                    res.status(200).json({ 
                        status: "success",
                        message: "User logged in successfully" 
                    });
                } else {
                    res.status(401).json({ 
                        status: "error",
                        error: "Invalid password" 
                    });
                }
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
} 

async function register(req, res){
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

async function logout(req, res){
    try {
        res.status(200).json({ 
            status: "success",
            message: "User logged out successfully" 
        });
    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function forgetPassword(req, res){
    try {
        const { email } = req.body;
        const userSnapshot = await db.collection("users").where("email", "==", email).get();
        if (userSnapshot.empty) {
            res.status(404).json({ 
                status: "error",
                error: "User not found" 
            });
        } 
        
        const token = Math.floor(100000 + Math.random() * 900000);
        const data = { 
            email: email,
            token: token,
            createdAt: new Date().toISOString(),
            isDone: false
        };
        await db.collection("passwordReset").doc().set(data);

        if (!process.env.EMAIL || !process.env.PASSWORD) {
            res.status(500).json({ 
                status: "error",
                error: "Email and password not set" 
            });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset",
            text: `Your password reset token is ${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).json({ 
                    status: "error",
                    error: error.message 
                });
            } else {
                res.status(200).json({ 
                    status: "success",
                    message: "Password reset token sent successfully" 
                });
            }
        });

    } catch (error) {
        res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const numericToken = Number(token);

        const userSnapshot = await db.collection("passwordReset").where("token", "==", numericToken).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ 
                status: "error",
                error: "Token not found" 
            });
        }

        let data;
        let docId;

        userSnapshot.forEach((doc) => {
            data = doc.data();
            docId = doc.id;
        });

        if (!data) {
            return res.status(404).json({ 
                status: "error",
                error: "Token not found" 
            });
        }

        if (data.isDone) {
            return res.status(400).json({ 
                status: "error",
                error: "Token already used" 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userDocs = await db.collection("users").where("email", "==", data.email).get();

        userDocs.forEach(async (userDoc) => {
            await db.collection("users").doc(userDoc.id).set({ 
                password: hashedPassword, 
                updatedAt: new Date().toISOString() 
            }, { merge: true });

            await db.collection("passwordReset").doc(docId).set({ isDone: true }, { merge: true });
        });

        return res.status(200).json({
            status: "success",
            message: "Password reset successfully"
        });

    } catch (error) {
        return res.status(500).json({ 
            status: "error",
            error: error.message 
        });
    }
}

export default { login, register, logout, forgetPassword, resetPassword };