require("dotenv").config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// db connection
const db = require("../database");

const utils = require("../utils/utils")

async function hashPassword(plain_password) {
    // complexity of hash
    const saltRounds = 10

    // encrypt the password using the sald
    return await bcrypt.hash(plain_password, saltRounds)
}

async function test() {
    console.log(a);
}

test()

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

async function logout(req, res) {
    const session_key = req.cookies.session_key

    if (!session_key) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key"
        })
    }
 
     try {
        user_id = utils.verifyUserFromSession(session_key)

        if(!user_id) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid session key"
            })
        }

        const data = db.prepare(`DELETE FROM sessions WHERE session_key = ?`).run(session_key)
        
        if(data.changes) {
            return res.status(200).json({
                status: 'success',
                message: 'logout successfully'
            })
        }

    }catch(err) {
        console.log(`Users All err: ${err}`);

        return res.status(400).json({
            status: 'error',
            error: "An error occured"
        })
    }

}

module.exports = {
    login,
    logout
}