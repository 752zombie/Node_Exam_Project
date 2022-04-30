import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.get("/conversations", async (req, res) => {
    const user = req.session.user;
    try {
        const preparedStatement = await db.prepare(`SELECT users.id AS userId, users.username, conversations.id AS conversationId
         FROM users INNER JOIN conversations ON (users.id = conversations.participant_1 OR conversations.participant_2 = users.id) AND users.id <> ? 
         WHERE conversations.participant_1 = ? OR conversations.participant_2 = ?`);
        
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : user.id});
        const users = await preparedStatement.all();
        res.send({result : "success", data : users});
    }

    catch(err) {
        console.log(err.message);
        res.send({result : "something went wrong"});
    }
})

export default router;