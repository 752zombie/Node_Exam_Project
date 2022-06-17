import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();


router.get("/comments", async (req, res) => {

    try {
    const preparedStatement = await db.prepare("SELECT * FROM comments");
    await preparedStatement.bind({1 : req.params.id});
    const comments = await preparedStatement.all();

    res.send({result : "success", comments : comments});
    
    }

    catch (err) {
        console.log(err.message) 
        res.send({message : "Could not get comments"})
    }
})


// Get replies on Comments from Post
router.get("/comment/replies/:post_id", async (req, res) => {
    
    try {
        
        const preparedStatement = await db.prepare("SELECT * FROM replies as r " + 
                                                   "INNER JOIN comments as c on c.id = r.comment_id " +
                                                   "INNER JOIN posts as p on p.id = c.post_id " +
                                                   "INNER JOIN users as u on u.id = r.user_id " +
                                                   "WHERE p.id = ?"                                           );
        await preparedStatement.bind({1 : req.params.post_id});
        const replies = await preparedStatement.all();
                
        res.send({result : "success", replies : replies});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


router.get("/comments/:id", async (req, res) => {

    try {
            
        const preparedStatement = await db.prepare("SELECT comments.id as comment_id, comment, comments.date, username " +
                                                   "FROM comments " + 
                                                   "INNER JOIN posts on " + 
                                                   "posts.id = comments.post_id " +
                                                   "INNER JOIN users on users.id = comments.user_id  " + 
                                                   "WHERE post_id = ?");
        await preparedStatement.bind({1 : req.params.id});
        const comments = await preparedStatement.all();

        res.send({result : "success", comments : comments});

    }
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


router.post("/comment", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        
        const preparedStatement = await db.prepare("INSERT INTO comments (comment, date, post_id, user_id) VALUES (?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.comment, 2 : req.body.date, 3 : req.body.postId, 4 : req.body.userId});
        await preparedStatement.run();
                
        res.send({result : "success"});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


router.post("/comment/reply", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        
        const preparedStatement = await db.prepare("INSERT INTO replies (reply, date, comment_id, user_id) VALUES (?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.reply, 2 : req.body.date, 3 : req.body.commentId, 4 : req.body.userId});
        await preparedStatement.run();
                
        res.send({result : "success"});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})






export default router;