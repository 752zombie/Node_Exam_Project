import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.post("/post", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        const user = req.session.user;

        console.log(await db.get("SELECT * FROM posts"))


        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, date, user) VALUES (?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.title, 2 : req.body.text, 3 : req.body.date, 4 : user.id});
        await preparedStatement.run();
        
        // add new user to session as currently logged in user
        
        res.send({result : "success"});
    }

    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }


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

    //send retrieved courses
    res.send({result : "success", posts : posts});
})

export default router;
