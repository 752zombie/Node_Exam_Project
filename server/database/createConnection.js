import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// this is needed to make database file be created relative to the file location of the script as oppposed to relative to the location of where the script is run  
const __dirname = dirname(fileURLToPath(import.meta.url));

export const db = await open({
    filename:  __dirname + "/forum.db",
    driver: sqlite3.Database
});