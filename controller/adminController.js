const nodemailer = require("nodemailer")
const requestIp = require('request-ip')
require("dotenv").config();

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// db connection
const db = require("../database")

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

async function createSession(user_id) {
    key = crypto.randomBytes(8).toString('hex');

    try {
        const result = db.prepare(`INSERT INTO sessions(user_id, session_key) VALUES(?, ?)`).run(user_id, key)
        data = result.rows[0]

        return {
            error: true,
            key: key
        }
    }
    catch (err) {
        console.log(`Session key error: ${err}`);
        
        return {
            error: true,
            key: ""
        }
    }
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

        console.log(data);
        
        
        if (await validatePassword(req.body.password, data.password)) {
            
            // ses = await createSession(data.id)

            // if (ses.error) {
            //     return res.status(500).json({
            //         error: "Could not create session key, try again later",
            //         ses_token: '',
            //         status: "failed"
            //     })
            // }

            return res.status(200).json({
                error: "Access granted",
                ses_token: data.id,
                status: "success"
            })
        } else {
            return res.status(400).json({
                error: "Invalid credentials",
                ses_token: '',
                status: "error"
            })
        }
    }
    catch (err) {
        console.log(err);
        
        return res.status(400).json({
            error: "An error occured",
            ses_token: '',
            status: "error"
        })
    }
}

module.exports = {
    login,
}