import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();


router.get("/likes/:id", async (req, res) => {

    let userLikes = []

    try {
        const preparedStatement = await db.prepare("SELECT * FROM post_like_user WHERE user_id = ?");
        await preparedStatement.bind({1 : req.params.id});
        userLikes = await preparedStatement.all();
    } 
    catch (error) {
        console.log(error)   
    }
    res.send({result : "success", userLikes : userLikes});
})


router.get("/like/:post_id", async (req, res) => {

    try {        
        const preparedStatement = await db.prepare("UPDATE posts SET like = like + 1 WHERE id = ?");
        await preparedStatement.bind({1 : req.params.post_id});
        await preparedStatement.run();     
        
    } catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
    res.send({result : "success"});
})

router.post("/like/post-to-user", async (req, res) => {
    
    try {        
        const preparedStatement = await db.prepare("INSERT INTO post_like_user (post_id, user_id) values (?, ?)");
        await preparedStatement.bind({1 : req.body.postId, 2 : req.body.userId});
        await preparedStatement.run();
                
        
    } catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
    res.send({result : "success", });
})

export default router;