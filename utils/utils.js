const db = require("../database")

function verifyUserFromSession(session_key) {
    const user_res = db.prepare(`SELECT * FROM sessions WHERE session_key = ?`).get(session_key)

    return user_res?.id || null
}

module.exports = {
    verifyUserFromSession
}