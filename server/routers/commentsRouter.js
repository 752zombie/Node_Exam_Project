import { Router } from "express";
import { db } from "../database/createConnection.js";
import { getDate } from "../util/getDate.js";

const router = Router();

// get all replies on a post identifed by "post_id"
router.get("/comment/replies/:post_id", async (req, res) => {
    
    try {
        
        const preparedStatement = await db.prepare("SELECT r.reply, r.comment_id, r.user_id, r.date, r.id, username FROM replies as r " + 
                                                   "INNER JOIN comments as c on c.id = r.comment_id " +                
                                                   "INNER JOIN users as u on u.id = r.user_id " +
                                                   "WHERE c.post_id = ?");
        await preparedStatement.bind({1 : req.params.post_id});
        const replies = await preparedStatement.all();
                
        res.send({replies : replies});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.sendStatus(404);
    }
})

// get all comments in the post identified by "id"
router.get("/comments/:id", async (req, res) => {

    try {
            
        const preparedStatement = await db.prepare("SELECT comments.id as comment_id, comment, comments.date, username, comments.user_id as user_id " +
                                                   "FROM comments " + 
                                                   "INNER JOIN users on users.id = comments.user_id  " + 
                                                   "WHERE post_id = ?");
        await preparedStatement.bind({1 : req.params.id});
        const comments = await preparedStatement.all();

        res.send({comments : comments});

    }
    
    catch(err) {
        console.log(err.message);
        res.sendStatus(404);
    }
})


router.post("/comment", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.sendStatus(401);
        return;
    }
    
    try {
        
        const preparedStatement = await db.prepare("INSERT INTO comments (comment, date, post_id, user_id) VALUES (?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.comment, 2 : getDate(), 3 : req.body.postId, 4 : user.id});
        await preparedStatement.run();
                
        res.sendStatus(201);
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
})


router.post("/comment/reply", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.sendStatus(401);
        return;
    }
    
    try {
        
        const preparedStatement = await db.prepare("INSERT INTO replies (reply, date, comment_id, user_id) VALUES (?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.reply, 2 : getDate(), 3 : req.body.commentId, 4 : user.id});
        await preparedStatement.run();
                
        res.sendStatus(201);
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
})


export default router;