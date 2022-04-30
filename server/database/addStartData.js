import { db } from "./createConnection.js";

await db.run("insert into conversations (participant_1, participant_2) values (1, 2)");

await db.close();