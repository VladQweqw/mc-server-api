const nodemailer = require("nodemailer")
const requestIp = require('request-ip')
require("dotenv").config();

// db connection
const db = require("../database");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const utils = require("../utils/utils")

function deleteOldEntries() {
    try {
        // verify if the user exists
        const result = db.prepare(`DELETE FROM users WHERE expired_date <= DATETIME('now', '-3 day')`).run()
        data = result

        console.log(`removed ${result.changes} entries older than 3 days`);

        return true
    }
    catch (err) {
        console.log(`Delete entries err: ${err}`);
        return false
    }
}

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


async function createAccount(){
    const usernmae = 'civil'
    

    const hash_pwd = await hashPassword(password)
    
    const res = db.prepare(`INSERT INTO users (username, password, isAdmin, isValid) VALUES (?, ?, 0, 1)`).run(usernmae, hash_pwd);
    
}


function createSession(user_id){
 const sessionKey = crypto.randomBytes(16).toString("hex");
    
     // remove oldclear
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
        const result = db.prepare(`SELECT * FROM users WHERE username = ?`).all(req.body.username)
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
            sameSite: "None",
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

async function request_access(req, res) {
    const clientIp = requestIp.getClientIp(req);

    try {
        // verify if the user exists
        const result = db.prepare(`SELECT * FROM users`).get()
        data = result


        if (!data) {
            const result = db.prepare(`INSERT INTO users (ip_address) VALUES (?)`).run(clientIp)
            data = result.rows

            return res.status(200).json({
                status: 'success',
                error: "Account awaiting for approval"
            })

        } else {
            return res.status(400).json({
                status: 'error',
                error: "Request already made"
            })
        }

    }
    catch (err) {
        console.log(`Users Req err: ${err}`);

        return res.status(400).json({
            status: 'error',
            error: "An error occured"
        })
    }
}

async function change_state(req, res) {
    let state = req.query.state
    let ip_address = req.query.ip_address
    const session_key = req.cookies.session_key
    
    if (!session_key || !['true', 'false'].includes(state) || !ip_address) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key / state"
        })
    }

    state = state === 'true' ? 1 : 0

    try {
        const admin = db.prepare(`SELECT * FROM sessions WHERE session_key = ?`).get(session_key)
        
        if(!admin) {
             return res.status(500).json({
                status: 'error',
                error: `Failed to get user from session key`
            })
        }
        
        const admin_id = admin.user_id
        
        if(!utils.isUSerAdmin(admin_id)) {
            return res.status(400).json({
                status: 'error',
                error: `User not admin`
            })
        }

        // verify if the user exists
        const data = db.prepare(`SELECT * FROM users WHERE ip_address = ?`).get(ip_address)

        if (!data) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid user ID"
            })
        } else {
            const data = db.prepare(`UPDATE users SET isValid = ? WHERE id = ?`).run(state, user_id)
            
            if (data.changes == 1) {
                return res.status(200).json({
                    status: 'success',
                    error: `User account changed state to ${state}`
                })
            } else {
                return res.status(400).json({
                    status: 'error',
                    error: `Failed to change user account state to ${state}`
                })
            }
        }
    }
    catch (err) {
        console.log(`Users Req err: ${err}`);

        return res.status(400).json({
            status: 'error',
            error: "An error occured"
        })
    }
}

async function get_user(req, res) { 
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
                error: "Invalid session key or user ID"
            })
        }
        const data = db.prepare(`SELECT ip_address, isAdmin, isValid, username, created_at FROM users WHERE id = ?`).get(user_id)
        
        if (!data) {
            return res.status(400).json({
                status: 'error',
                error: "User not found"
            })
        }else {
            return res.status(200).json({
                status: 'success',
                user: data
            })
        }
    }
    catch (err) {
        console.log(`GET USER ERR ${err}`);
        
        return res.status(400).json({
            status: 'error',
            error: "User with this IP doesn't exist"
        })
    }
}

async function get_all_users(req, res) {
    const session_key = req.cookies.session_key

    if (!session_key) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key"
        })
    }

    try {
        admin_id = utils.verifyUserFromSession(session_key)
        
        if(!admin_id || !utils.isUSerAdmin(admin_id)) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid session key or user ID"
            })
        }
        
        const users = db.prepare(`SELECT ip_address, username, created_at, isAdmin, isValid FROM users`).all()
        
         return res.status(200).json({
            status: 'success',
            users: users,
        })

    }catch(err) {
        console.log(`Users All err: ${err}`);

        return res.status(400).json({
            status: 'error',
            error: "An error occured"
        })
    }
}

async function delete_user(req, res) {
    const session_key = req.cookies?.session_key
    const user_id = req.body?.user_id

    if (!session_key || !user_id) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid Session key / user id"
        })
    }

    try {
        admin_id = utils.verifyUserFromSession(session_key)
        
        if(!user_id || !utils.isUSerAdmin(admin_id)) {
            return res.status(400).json({
                status: 'error',
                error: "Invalid session key or invalid user permissions"
            })
        }
        
        // verify if the user exists
        const data = db.prepare(`DELETE FROM users WHERE id = ?`).run(user_id)
        console.log(data);

        if(data.changes) {
             return res.status(200).json({
                status: 'success',
                error: "User deleted"
            })
        }else {
             return res.status(400).json({
                status: 'error',
                error: "Invalid user ID"
            })
        }
        
    }
    catch (err) {
        console.log(`Users Req err: ${err}`);

        return res.status(400).json({
            status: 'error',
            error: "An error occured"
        })
    }
}

module.exports = {
    request_access,
    change_state,
    get_user,
    delete_user,
    get_all_users,
    login,
    logout,
}