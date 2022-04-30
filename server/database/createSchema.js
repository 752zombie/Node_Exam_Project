import { db } from "./createConnection.js";

// create some tables
await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    email VARCHAR(100) UNIQUE NOT NULL,
    password NOT NULL, 
    username VARCHAR(100) UNIQUE NOT NULL 
    );`);


await db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    title VARCHAR(100) NOT NULL,
    text NOT NULL,
    photo BLOB,
    like INTEGER DEFAULT 0,
    date NOT NULL, 
    user_id NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) 
    );`);


await db.exec(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    comment NOT NULL,
    date NOT NULL, 
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id)
    FOREIGN KEY(user_id) REFERENCES users(id)  
    );`);


await db.exec(`CREATE TABLE IF NOT EXISTS post_like_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id)
    FOREIGN KEY(user_id) REFERENCES users(id)  
    );`);
    

await db.exec(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    participant_1 INTEGER NOT NULL,
    participant_2 INTEGER NOT NULL,
    FOREIGN KEY(participant_1) REFERENCES users(id),
    FOREIGN KEY(participant_2) REFERENCES users(id) 
    );`);

await db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    text NOT NULL,
    FOREIGN KEY(receiver_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id) 
    );`);

await db.close();