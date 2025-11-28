const nodemailer = require("nodemailer")
const requestIp = require('request-ip')
require("dotenv").config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// db connection
const db = require("../database");

async function hashPassword(plain_password) {
    // complexity of hash
    const saltRounds = 10

    // encrypt the password using the sald
    return await bcrypt.hash(plain_password, saltRounds)
}

async function validatePassword(plain_password, hashed_password) {
    // hash the entered password
    return await bcrypt.compare(plain_password, hashed_password)
}

function createSession(user_id){
 const sessionKey = crypto.randomBytes(16).toString("hex");
    
     // remove old
    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(user_id)
    db.prepare(`INSERT INTO sessions (user_id, session_key) VALUES (?, ?)`).run(user_id, sessionKey);

    return sessionKey
}

async function login(req, res) {
    if (!req.body) {
        return res.status(400).json({
            error: "Invalid data sent",
            status: "error"
        })
    }

    try {
        const result = db.prepare(`SELECT * FROM admins WHERE username = ?`).all(req.body.username)
        const data = result[0]
        
        if(!data) {
            return res.status(400).json({
                error: "User not found",
                status: "error"
            })
        }

        if (await validatePassword(req.body.password, data.password)) {
            const sessionKey = createSession(data.id)

            res.cookie("session_key", sessionKey, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 86400000
            });

            return res.status(200).json({
                error: "Access granted",
                status: "success"
            })
        } else {
            return res.status(400).json({
                error: "Invalid credentials",
                status: "error"
            })
        }
    }
    catch (err) {
        console.log(err);
        
        return res.status(400).json({
            error: "An error occured",
            status: "error"
        })
    }
}



module.exports = {
    login,
}