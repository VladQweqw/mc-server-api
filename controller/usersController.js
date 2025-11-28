const nodemailer = require("nodemailer")
const requestIp = require('request-ip')
require("dotenv").config();

// db connection
const db = require("../database")

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

async function request_access(req, res) {
    const clientIp = requestIp.getClientIp(req);
    deleteOldEntries()

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
    const clientIp = requestIp.getClientIp(req);
    const user_ip = req.body.ip_address
    const state = req.query.state.toString()
    

    if (!user_ip || !['true', 'false'].includes(state)) {
        return res.status(400).json({
            status: 'error',
            error: "Invalid user IP / state"
        })
    }

    try {
        // verify if the user exists
        const data = db.prepare(`SELECT * FROM users WHERE ip_address = ?`).get(clientIp)


        if (!data) {
            return res.status(400).json({
                status: 'error',
                error: "User with this IP doesn't exist"
            })
        } else {
            const data = db.prepare(`UPDATE users SET isValid = ? WHERE ip_address = ?`).run(state, user_ip)

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
    user_id = req.body.ip_address
    
    try {
        const data = db.prepare(`SELECT ip_address, isValid, expired_date FROM users WHERE ip_address = ?`).get(user_id)
        
        if (!data) {
            return res.status(400).json({
                status: 'error',
                error: "User with this IP doesn't exist"
            })
        }else {
            return res.status(200).json({
                status: 'success',
                user: data
            })
        }
    }
    catch (err) {
        return res.status(400).json({
            status: 'error',
            error: "User with this IP doesn't exist"
        })
    }

    return res.status(500).json({
        status: 'error',
        error: "An error occured"
    })
}

async function delete_user(req, res) {
    const clientIp = requestIp.getClientIp(req);

    console.log(clientIp);

    return res.status(200).json({
        ip: clientIp
    })
}

module.exports = {
    request_access,
    change_state,
    get_user,
    delete_user,
}