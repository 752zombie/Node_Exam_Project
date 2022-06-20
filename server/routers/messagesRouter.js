import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

// get all the conversations (shallow) that the logged in user is currently a part of
router.get("/conversations", async (req, res) => {
    const user = req.session.user;

    if (!user) {
        res.sendStatus(401);
        return;
    }


    try {
        const preparedStatement = await db.prepare(`SELECT users.id AS userId, users.username, conversations.id AS conversationId, conversations.mark_for_delete as markForDelete
         FROM users INNER JOIN conversations ON (users.id = conversations.participant_1 OR conversations.participant_2 = users.id) AND users.id <> ? 
         WHERE (conversations.participant_1 = ? OR conversations.participant_2 = ?) AND (conversations.mark_for_delete IS NULL OR conversations.mark_for_delete <> ?)`);
        
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : user.id, 4 : user.id});
        const users = await preparedStatement.all();
        res.send({data : users});
    }

    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
})

// get all the messages in a single conversation
router.get("/conversations/:id", async (req, res) => {
    const user = req.session.user;
    const conversationId = req.params.id;

    if (!user) {
        res.sendStatus(401);
        return;
    }

    if (!conversationId) {
        res.sendStatus(400);
        return;
    }

    try {
        const preparedStatement = await db.prepare(`SELECT users.username AS sender, users.id as senderId, messages.text 
        FROM messages INNER JOIN users ON sender_id = users.id 
        WHERE conversation_id = ? AND (sender_id = ? OR receiver_id = ?) AND (mark_for_delete IS NULL OR mark_for_delete <> ?)`);
        
        await preparedStatement.bind({1 : conversationId, 2 : user.id, 3 : user.id, 4 : user.id});
        const messages = await preparedStatement.all();

        res.send({messages : messages});
    }

    catch(err) {
        res.sendStatus(500);
    }


})

// delete a specific conversation (will not actually be deleted from database until both participants have requested a delete)
router.delete("/conversations/:id", async (req, res) => {
    const user = req.session.user;
    const conversationId = req.params.id;
    
    if (!user) {
        res.sendStatus(401);
        return;
    }

    if (!conversationId) {
        res.sendStatus(400);
        return;
    }
    
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

        preparedStatement = await db.prepare("UPDATE conversations SET mark_for_delete = ? WHERE (participant_1 = ? OR participant_2 = ?) AND id = ?");
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : user.id, 4 : conversationId});
        await preparedStatement.run();

        preparedStatement = await db.prepare("SELECT * FROM messages WHERE (sender_id = ? OR receiver_id = ?) AND conversation_id = ?");
        await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : conversationId});
        const messages = await preparedStatement.all();


        // the conversation has no messages and should be deleted
        if (messages.length === 0) {
            preparedStatement = await db.prepare("DELETE FROM conversations WHERE (participant_1 = ? OR participant_2 = ?) AND id = ?");
            await preparedStatement.bind({1 : user.id, 2 : user.id, 3 : conversationId});
            await preparedStatement.run();
        }

        res.sendStatus(200);
        
    }

    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
})

export default router;