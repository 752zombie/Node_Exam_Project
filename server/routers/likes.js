import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();


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

export default router;