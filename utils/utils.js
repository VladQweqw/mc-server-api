const db = require("../database")
const { execSync } = require("child_process");

function verifyUserFromSession(session_key) {
    const user_res = db.prepare(`SELECT * FROM sessions WHERE session_key = ?`).get(session_key)

    return user_res?.id || null
}

function cli(command) {
    let response = {
        output: "",
        status: 'success'
    }

    try {
        const output = execSync(command)    
        response.output = output
         
    } catch(err) {
        response.output = err.message
        response.status = 'error'
    }
    
    return response
}

module.exports = {
    verifyUserFromSession,
    cli
}