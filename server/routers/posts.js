import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.post("/post", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        const user = req.session.user;

        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, photo, date, user_id) VALUES (?, ?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.title, 2 : req.body.text, 3 : req.body.photo, 4 : req.body.date, 5 : user.id});
        await preparedStatement.run();
                
        res.send({result : "success"});
    
    } catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


router.get("/post/:id", async (req, res) => {
    
    const preparedStatement = await db.prepare("SELECT * FROM posts WHERE id = ?");
    await preparedStatement.bind({1 : req.params.id});
    const post = await preparedStatement.all();
    
    res.send({result : "success", post : post[0]});
})


router.post("/posts", async (req, res) => {

    //checks current page and sets max 5 Posts to render 
    let page = 1;
    if (req.body.page) {
        const parsed = parseInt(req.body.page);
        page = isNaN(parsed) ? 1 : parsed; 
    }

    const offset = (page - 1) * 5;
    
    //retrieve Posts from db and check for Likes from User
    const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.like, p.date, ifnull(l.user_id, 0) as liked " +    
                                               "FROM posts as p " + 
                                               "LEFT JOIN post_like_user as l on l.post_id = p.id " +
                                               "WHERE p.user_id = ? " +
                                               "LIMIT 5 OFFSET ?");
    await preparedStatement.bind({1 : req.body.userId, 2 : offset});
    const posts = await preparedStatement.all();

    //send retrieved Posts
    res.send({result : "success", posts : posts});
})

export default router;
