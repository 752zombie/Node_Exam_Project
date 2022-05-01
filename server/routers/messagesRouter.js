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

router.delete("/conversation/:id", async (req, res) => {
    const user = req.session.user;
    const conversationId = req.params.id;
    
    try {
        // delete messages if both sender and receiver wants the messages deleted
        // the logic is: if mark_delete_id equals NULL (default) then noone has requested a delete. If mark_for_delete equals an id, then the the user with that id has requested a delete   
        let preparedStatement = await db.prepare("DELETE FROM messages WHERE conversation_id = ? AND (sender_id = ? OR receiver_id = ?) AND (mark_for_delete <> ? AND mark_for_delete IS NOT NULL)");
        await preparedStatement.bind({1 : conversationId, 2 : user.id, 3 : user.id, 4 : user.id});
        await preparedStatement.run();
        
        // mark for deletion for the logged in user (will affect 0 rows if the previous SQL statement deleted all rows in the conversation)
        preparedStatement = await db.prepare("UPDATE messages SET mark_for_delete = ? WHERE (sender_id = ? OR receiver_id = ?) AND conversation_id = ?");
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : user.id, 4 : conversationId});
        await preparedStatement.run();

        preparedStatement = await db.prepare("SELECT * FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND conversation_id = ?");
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : conversationId});
        const messages = await db.all();

        // the conversation has no messages and should be deleted
        if (messages.length === 0) {
            preparedStatement = await db.prepare("DELETE FROM conversations WHERE (participant_1 = ? OR participant_2 = ?) and conversation_id = ?");
            await db.bind({1 : user.id, 2 : user.id, 3 : conversationId});
            await db.run();
        }

        res.send({result : "success"});
        
    }

    catch(err) {
        res.send({result : "something went wrong"});
    }
})

export default router;