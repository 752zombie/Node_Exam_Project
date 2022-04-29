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

router.get("/comments/:id", async (req, res) => {

    try {
            
        const preparedStatement = await db.prepare("SELECT comment, comments.date, username " +
                                                "FROM comments " + 
                                                "INNER JOIN posts on " + 
                                                "posts.id = comments.post_id " +
                                                "INNER JOIN users on users.id = posts.user_id " + 
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



export default router;