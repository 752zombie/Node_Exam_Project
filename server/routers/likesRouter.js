import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();


// Set like in relation to user
router.post("/like/post-to-user", async (req, res) => {

    try {        
        const preparedStatement = await db.prepare("INSERT INTO post_like_user (post_id, user_id) values (?, ?)");
        await preparedStatement.bind({1 : req.body.postId, 2 : req.body.userId});
        await preparedStatement.run();             
    } 

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }  
    res.send({result : "success"});  
})


// Increment number of likes on post
router.patch("/like", async (req, res) => {

    try {        
        const preparedStatement = await db.prepare("UPDATE posts SET like = like + 1 WHERE id = ?");
        await preparedStatement.bind({1 : req.body.postId});
        await preparedStatement.run();     
        
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
    res.send({result : "success"});
})


// Decrement number of likes on post
router.patch("/like/unlike", async (req, res) => {
    
    try {        
        const preparedStatement = await db.prepare("UPDATE posts SET like = like - 1 WHERE id = ?");
        await preparedStatement.bind({1 : req.body.postId});
        await preparedStatement.run();     
        
    } 

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
    res.send({result : "success"});
})


// Remove like in relation to user
router.delete("/like/unlike/post-to-user", async (req, res) => {

    try {        
        const preparedStatement = await db.prepare("DELETE FROM post_like_user " + 
                                                   "WHERE post_id = ? and user_id = ?");
        await preparedStatement.bind({1 : req.body.postId, 2 : req.body.userId});
        await preparedStatement.run();     
    } 

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
    res.send({result : "success"});
})


export default router;