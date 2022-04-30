import { Router } from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import { db } from "../database/createConnection.js";

const router = Router();


router.post("/sign-up", async (req, res) => {
    const formData = req.body;
    // check for valid fields
    if (!formData.email || !formData.password || !formData.username) {
        res.send({result : "invalid fields"});
        return;
    }


    // encrypt password and add user to DB
    const saltrounds = 10;
    const hash = await bcrypt.hash(formData.password, saltrounds);

    try {
        const preparedStatement = await db.prepare("INSERT INTO users (email, password, username) VALUES (?, ?, ?)");
        await preparedStatement.bind({1 : formData.email, 2 : hash, 3 : formData.username});
        await preparedStatement.run();
        
        // add new user to session as currently logged in user
        req.session.isLoggedIn = true;
        req.session.user = {email : formData.email, username : formData.username};
        res.send({result : "success", user : {email : formData.email, username : formData.username}});
    }

    catch(err) {
        console.log(err.message);
        res.send({ result : "User with email or username already exists"});
    }



})

router.post("/sign-in", async (req, res) => {
    const formData = req.body;
    if (!formData.email || !formData.password) {
        res.send({result : "invalid fields"});
        return;
    }

    const preparedStatement = await db.prepare("SELECT * FROM users WHERE email = ?");
    await preparedStatement.bind({1 : formData.email});
    
    try {
        const user = await preparedStatement.get();
        await preparedStatement.finalize();

        //console.log("LOGIN " + user)
    
    
        bcrypt.compare(formData.password, user.password, (err, same) => {
            if (err) {
                res.send({result : "server error"});
            }
    
            else if (same) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                res.send({result : "success", user : {userId : user.id, username : user.username, email : user.email}});
            }
    
            else {
                res.send({result : "wrong email or password"});
            }
        })
    }

    catch(err) {
        res.send({result : "wrong email or password"});
    }


})

router.post("/sign-out", (req, res) => {

    try {
    req.session.destroy((err) => {
        res.send({result : "success"});
    })

    }

    catch(err) {
        res.send({result : "Could not logout"});
    }    
})

router.get("/secret", (req, res) => {
    if (!req.session.isLoggedIn) {
        res.send("this is a secret");
    }

    else {
        res.send("here you go " + req.session.user.username);
    }
})


export default router;