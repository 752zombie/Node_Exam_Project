import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const db = await open({
    filename:  __dirname + "/forum.db",
    driver: sqlite3.Database
});