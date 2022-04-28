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
    photo BLOB NOT NULL,
    date NOT NULL, 
    user NOT NULL,
    FOREIGN KEY(user) REFERENCES users(id) 
    );`);


await db.exec(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    comment NOT NULL,
    date NOT NULL, 
    post_id INTEGER NOT NULL,
    FOREIGN KEY(post_id) REFERENCES posts(id) 
    );`);
    

await db.close();