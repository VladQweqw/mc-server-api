const db = require("../database")
const { execSync } = require("child_process");

function verifyUserFromSession(session_key) {
    const user_res = db.prepare(`SELECT * FROM sessions WHERE session_key = ?`).get(session_key)

    return user_res?.user_id || null
}

function isUSerAdmin(user_id) {
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(user_id)

    return user?.isAdmin | null
}

function isUserVAlid(user_id) {
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(user_id)

    return user?.isValid | null
}

function cli(command) {
    let response = {
        output: "",
        status: 'success'
    }

    try {
        const output = execSync(command)    
        response.output = output.toString()
         
    } catch(err) {
        response.output = err.message
        response.status = 'error'
    }
    
    return response
}

module.exports = {
    verifyUserFromSession,
    cli,
    isUserVAlid,
    isUSerAdmin
}