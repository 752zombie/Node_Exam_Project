import { db } from "../database/createConnection.js";

function chat(socket, session) {
    return async function(to, msg) {
        try {
            // check if conversation exists and both sender and receiver is a part of it.
            let preparedStatement = await db.prepare("SELECT id FROM conversations WHERE (participant_1 = ? AND participant_2 = ?) OR (participant_1 = ? AND participant_2 = ?)");
            await preparedStatement.bind({1 : session.user.id, 2 : to, 3 : to, 4 : session.user.id});
            let conversation = await preparedStatement.get();
    
            preparedStatement = await db.prepare("UPDATE conversations SET mark_for_delete = NULL WHERE (participant_1 = ? AND participant_2 = ?) OR (participant_1 = ? AND participant_2 = ?)");
            await preparedStatement.bind({1 : session.user.id, 2 : to, 3 : to, 4 : session.user.id});
            await preparedStatement.run();
    
            // conversation does not exist: create conversation and retrieve conversation id
            if (!conversation) {
                preparedStatement = await db.prepare("INSERT INTO conversations (participant_1, participant_2) VALUES (?, ?)");
                await preparedStatement.bind({1 : session.user.id, 2 : to});
                await preparedStatement.run();
                
                preparedStatement = await db.prepare("SELECT id FROM conversations WHERE (participant_1 = ? AND participant_2 = ?) OR (participant_1 = ? AND participant_2 = ?)");
                await preparedStatement.bind({1 : session.user.id, 2 : to, 3 : to, 4 : session.user.id});
                conversation = await preparedStatement.get();
            }
    
            preparedStatement = await db.prepare("INSERT INTO messages (conversation_id, sender_id, receiver_id, text) VALUES (?, ?, ?, ?) ");
            await preparedStatement.bind({1 : conversation.id, 2 : session.user.id, 3 : to, 4 : msg});
            await preparedStatement.run();
            socket.to(parseInt(to)).emit("chat message", {sender : session.user.username, text : msg, conversationId : conversation.id, senderId : session.user.id});
        }
    
        catch(err) {
            console.log(err.message);
        }          
    }
}

export default chat;