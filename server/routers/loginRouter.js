import { Router } from "express";
import bcrypt from "bcrypt";
import session from "express-session";
import { db } from "../database/createConnection.js";

const router = Router();

router.get("/username/:id", async (req, res) => {
    try {
        const preparedStatement = await db.prepare("SELECT username FROM users WHERE id = ?");
        await preparedStatement.bind({1 : req.params.id});
        const result = await preparedStatement.get();

        if (result) {
            res.send({data : result});
        }

        else {
            res.sendStatus(404);
        }
    }

    catch(err) {
        res.sendStatus(500);
    }
})

router.post("/sign-up", async (req, res) => {
    const formData = req.body;
    // check for valid fields
    if (!formData.email || !formData.password || !formData.username) {
        res.statusMessage = "Invalid fields";
        res.sendStatus(400);
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
        res.send({user : {email : formData.email, username : formData.username}});
    }

    catch(err) {
        console.log(err.message);
        res.statusMessage = "User with that email or username already exists";
        res.sendStatus(409);
    }



})

router.post("/sign-in", async (req, res) => {
    const formData = req.body;
    if (!formData.email || !formData.password) {
        res.statusMessage = "Invalid fields";
        res.sendStatus(400);
        return;
    }
    
    try {

        const preparedStatement = await db.prepare("SELECT * FROM users WHERE email = ?");
        await preparedStatement.bind({1 : formData.email});
        
        const user = await preparedStatement.get();
        await preparedStatement.finalize();
    
        bcrypt.compare(formData.password, user.password, (err, same) => {
            if (err) {
                res.sendStatus(500);
            }
    
            else if (same) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                res.send({user : {userId : user.id, username : user.username, email : user.email}});
            }
    
            else {
                res.statusMessage = "Wrong email or password";
                res.sendStatus(401);
            }
        })
    }

    catch(err) {
        res.statusMessage = "Wrong email or password";
        res.sendStatus(401);
    }


})

router.post("/sign-out", (req, res) => {

    try {
        req.session.destroy((err) => {
            res.sendStatus(200);
        })

    }

    catch(err) {
        res.sendStatus(500);
    }    
})




export default router;