import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();


router.post("/like", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.send({result : "you need to be logged in"});
        return;
    }

    try {        
        let preparedStatement = await db.prepare("INSERT INTO post_like_user (post_id, user_id) values (?, ?)");
        await preparedStatement.bind({1 : req.body.postId, 2 : user.id});
        await preparedStatement.run();
        
        // not necessary to check if previous statement had any effect as unique constraint would have failed
        preparedStatement = await db.prepare("UPDATE posts SET like = like + 1 WHERE id = ?");
        await preparedStatement.bind({1 : req.body.postId});
        await preparedStatement.run();

        res.send({result : "success"});  
    } 

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not like post"});
    }  
    

})


// Decrement number of likes on post
router.post("/unlike", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.send({result : "you need to be logged in"});
        return;
    }
    
    try {
        let preparedStatement = await db.prepare("SELECT * FROM post_like_user WHERE post_id = ? AND user_id = ?");
        await preparedStatement.bind({1 : req.body.postId, 2 : user.id});
        const result = await preparedStatement.all();

        // only decrement likes from post if any rows will actually be deleted
        if (result.length > 0) {
            preparedStatement = await db.prepare("UPDATE posts SET like = like - 1 WHERE id = ?");
            await preparedStatement.bind({1 : req.body.postId});
            await preparedStatement.run(); 
        }

        preparedStatement = await db.prepare("DELETE FROM post_like_user WHERE post_id = ? AND user_id = ?");
        await preparedStatement.bind({1 : req.body.postId, 2 : user.id});
        await preparedStatement.run();

        res.send({result : "success"});
    } 

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not unlike post"});
    }
    

})


export default router;