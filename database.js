const Database = require('better-sqlite3');
const db = new Database('minecraft.db');

db.pragma("foreign_keys = ON");

// users table
db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT,
    isValid BOOLEAN DEFAULT false,
    expired_date DATE DEFAULT (DATE('now','-1 day'))
)`).run();

// admins
db.prepare(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`).run()


db.prepare(`
    INSERT OR IGNORE INTO admins(username, password) 
    VALUES(?, ?)
`).run(
    "vlad", 
    "$2b$10$cIpsHcFA/0vOlihsbYfz0.Sh6smvyPKh0Huzwahf3vtlG6E0UC3By"
);

// sessions
db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_key TEXT NOT NULL,
    created_at DATE DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (user_id) REFERENCES admins(id)
)`).run();

module.exports = db
