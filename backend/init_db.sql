-- Initialize database schema for confessionrooms application

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Create confessions table
CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    room TEXT NOT NULL,
    content TEXT NOT NULL,
    context TEXT,
    ipaddress TEXT,
    created_at TEXT NOT NULL,
    is_visible INTEGER DEFAULT 1,
    FOREIGN KEY (room) REFERENCES rooms(code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_confessions_room ON confessions(room);
CREATE INDEX IF NOT EXISTS idx_confessions_is_visible ON confessions(is_visible);
CREATE INDEX IF NOT EXISTS idx_confessions_room_visible ON confessions(room, is_visible);
CREATE INDEX IF NOT EXISTS idx_confessions_token ON confessions(token);
