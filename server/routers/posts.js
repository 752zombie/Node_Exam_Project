import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.post("/post", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        const user = req.session.user;

        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, photo, date, user) VALUES (?, ?, ?, ?, ?)");
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


router.get("/posts/:page", async (req, res) => {

    //check input
    let page = 1;
    if (req.params.page) {
        const parsed = parseInt(req.params.page);
        page = isNaN(parsed) ? 1 : parsed; 
    }

    const offset = (page - 1) * 5;
    
    //retrieve posts from db
    const preparedStatement = await db.prepare("SELECT * FROM posts LIMIT 5 OFFSET ?");
    await preparedStatement.bind({1 : offset});
    const posts = await preparedStatement.all();

    //send retrieved posts
    res.send({result : "success", posts : posts});
})

export default router;
