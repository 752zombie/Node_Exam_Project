import { Router } from "express";
import { db } from "../database/createConnection.js";
import { getDate } from "../util/getDate.js";

const router = Router();

// This function collects the Post & checks 
// whether User Liked the Post & number of Comments on Post
router.get("/posts/:page", async (req, res) => {

    const user = req.session.user;

    try {
        //checks current page and sets max 5 Posts to render 
        let page = 1;
        if (req.params.page) {
            const parsed = parseInt(req.params.page);
            page = isNaN(parsed) ? 1 : parsed; 
        }

        const offset = (page - 1) * 5;
        
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.video, p.like, p.date, p.user_id, u.username, " +
                                                   "ifnull(l.user_id, 0) as liked, COUNT(DISTINCT c.id) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on (l.post_id = p.id) AND l.user_id = ? " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +                                                     
                                                   "GROUP BY p.id " + 
                                                   "ORDER BY p.id DESC " +
                                                   "LIMIT 5 OFFSET ?");
        await preparedStatement.bind({1: user ? user.id : -1, 2 : offset});
        const posts = await preparedStatement.all();
        res.send({result : "success", posts : posts});
        
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})

//Get Post and check for Likes from User
router.get("/post/:id", async (req, res) => {

    const user = req.session.user;
    
    try { 
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.video, p.like, p.date, p.user_id, u.username, " + 
                                                   "ifnull(l.user_id, 0) as liked, COUNT(DISTINCT c.id) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on (l.post_id = p.id) AND l.user_id = ? " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +
                                                   "WHERE p.id = ? " +                                                     
                                                   "GROUP BY p.id ");
        await preparedStatement.bind({1 : user ? user.id : -1, 2 : req.params.id});
        const post = await preparedStatement.all();       
        res.send({result : "success", post : post[0]});
    
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
    }    

})


// Gets all Posts related to User
router.get("/posts/user/:user_id", async (req, res) => {

    const user = req.session.user;
    
    try { 
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.like, p.date, u.username, " +
                                                   "ifnull(l.user_id, 0) as liked, COUNT(DISTINCT c.id) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on (l.post_id = p.id) AND l.user_id = ? " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +
                                                   "WHERE u.id = ? " +                                                     
                                                   "GROUP BY p.id ");
        await preparedStatement.bind({1 : user ? user.id : -1, 2 : req.params.user_id});
        const posts = await preparedStatement.all();       
        res.send({result : "success", posts : posts});
    
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
    }    

})


router.post("/post", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.send({result : "you need to be logged in"});
        return;
    }
    
    try {
        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, photo, video, date, user_id) VALUES (?, ?, ?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.title, 2 : req.body.text, 3 : req.body.photo, 4 : req.body.video, 5 : getDate(), 6 : user.id});
        await preparedStatement.run();               
        res.send({result : "success"});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})




// This function returns Posts based on sort call
// This function collects the Post & checks 
// whether User Liked the Post & number of Comments on Post
router.post("/posts/sort", async (req, res) => {

    const user = req.session.user;

    try {

        //checks current page and sets max 5 Posts to render 
        let page = 1;
        if (req.body.pageToFetch) {
            const parsed = parseInt(req.body.page);
            page = isNaN(parsed) ? 1 : parsed; 
        }

        const offset = (page - 1) * 5;

        // Sets sorting condition based on sort order
        let sqlCall = sortBy(req.body.sortOrder);

        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare(sqlCall);
        await preparedStatement.bind({1 : user ? user.id : -1, 2 : offset});
        const posts = await preparedStatement.all();
        res.send({result : "success", posts : posts});

    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})

function sortBy(sortOrder) {
    return "SELECT p.id, p.title, p.text, p.photo, p.like, p.date, u.username, " + 
           "ifnull(l.user_id, 0) as liked, COUNT(DISTINCT c.id) as comment_count, COUNT(reply) as reply_count " +    
           "FROM posts as p " + 
           "LEFT JOIN post_like_user as l on (l.post_id = p.id) AND l.user_id = ? " +
           "LEFT JOIN comments as c on c.post_id = p.id " +
           "LEFT JOIN replies as r on r.comment_id = c.id " +
           "INNER JOIN users as u on u.id = p.user_id " +  
           "GROUP BY p.id " +
           "ORDER BY " + (sortOrder === "sortByComments" ? "COUNT(comment)" : "p.like") + " DESC " + 
           "LIMIT 5 OFFSET ?"
}


// Delete Post
router.delete("/post", async (req, res) => {

    const user = req.session.user;

    if (!user) {
        res.send({result : "you need to be logged in"});
        return;
    }

    try { 
        const preparedStatement = await db.prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
        await preparedStatement.bind({1 : req.body.postId, 2 : user.id})
        await preparedStatement.run();
        res.send({})  
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not delete the post"})
    }    

})


export default router;
