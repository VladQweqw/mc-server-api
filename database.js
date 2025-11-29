const Database = require('better-sqlite3');
const db = new Database('minecraft.db');

db.pragma("foreign_keys = ON");

// users table
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT,
    username TEXT OT NULL UNIQUE,
    password TEXT NOT NULL,
    isValid BOOLEAN DEFAULT false,
    isAdmin BOOLEAN DEFAULT false,
    created_at DATE DEFAULT (DATE('now','1 day'))
)`).run();

// sessions
db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_key TEXT NOT NULL,
    created_at DATE DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
)`).run();

module.exports = db
