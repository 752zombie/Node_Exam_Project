import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.post("/post", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        const user = req.session.user;

        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, photo, video, date, user_id) VALUES (?, ?, ?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.title, 2 : req.body.text, 3 : req.body.photo, 4 : req.body.video, 5 : req.body.date, 6 : user.id});
        await preparedStatement.run();               
        res.send({result : "success"});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


//Get Post and check for Likes from User
router.get("/post/:id", async (req, res) => {
    
    try { 
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.video, p.like, p.date, p.user_id, u.username, " + 
                                                   "ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on l.post_id = p.id " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +
                                                   "WHERE p.id = ? " +                                                     
                                                   "GROUP BY p.id ");
        await preparedStatement.bind({1 : req.params.id});
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
    
    try { 
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.like, p.date, u.username, " +
                                                   "ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on l.post_id = p.id " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +
                                                   "WHERE u.id = ? " +                                                     
                                                   "GROUP BY p.id ");
        await preparedStatement.bind({1 : req.params.user_id});
        const posts = await preparedStatement.all();       
        res.send({result : "success", posts : posts});
    
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
    }    

})


// Delete Post
router.delete("/post", async (req, res) => {

    try { 
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("DELETE FROM posts WHERE id = ?");
        await preparedStatement.bind({1 : req.body.postId})
        await preparedStatement.run();
        res.send({})  
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not delete the post"})
    }    

})

// This function collects the Post & checks 
// whether User Liked the Post & number of Comments on Post
router.post("/posts", async (req, res) => {

    try {
        //checks current page and sets max 5 Posts to render 
        let page = 1;
        if (req.body.page) {
            const parsed = parseInt(req.body.page);
            page = isNaN(parsed) ? 1 : parsed; 
        }

        const offset = (page - 1) * 5;
        
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.video, p.like, p.date, p.user_id, u.username, " +
                                                   "ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count, COUNT(reply) as reply_count " +    
                                                   "FROM posts as p " + 
                                                   "LEFT JOIN post_like_user as l on l.post_id = p.id " +
                                                   "LEFT JOIN comments as c on c.post_id = p.id " +
                                                   "LEFT JOIN replies as r on r.comment_id = c.id " +      
                                                   "INNER JOIN users as u on u.id = p.user_id " +                                                     
                                                   "GROUP BY p.id " + 
                                                   "ORDER BY p.id DESC " +
                                                   "LIMIT 5 OFFSET ?");
        await preparedStatement.bind({1 : offset});
        const posts = await preparedStatement.all();
        res.send({result : "success", posts : posts});
        
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})


// This function returns Posts based on sort call
// This function collects the Post & checks 
// whether User Liked the Post & number of Comments on Post
router.post("/posts/sort", async (req, res) => {

    try {

        //checks current page and sets max 5 Posts to render 
        let page = 1;
        if (req.body.pageToFetch) {
            const parsed = parseInt(req.body.page);
            page = isNaN(parsed) ? 1 : parsed; 
        }

        const offset = (page - 1) * 5;

        // Sets sorting condition based on sort order
        let sqlCall = ""

        if (req.body.sortOrder === "sortByComments") {
            sqlCall = sortByComments()
        }
        else {
            sqlCall = sortByLikes()
        }

        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare(sqlCall);
        await preparedStatement.bind({1 : offset});
        const posts = await preparedStatement.all();
        res.send({result : "success", posts : posts});

    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})

function sortByComments() {
    return "SELECT p.id, p.title, p.text, p.photo, p.video, p.like, p.date, u.username, " +
           "ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count, COUNT(reply) as reply_count " +    
           "FROM posts as p " + 
           "LEFT JOIN post_like_user as l on l.post_id = p.id " +
           "LEFT JOIN comments as c on c.post_id = p.id " +
           "LEFT JOIN replies as r on r.comment_id = c.id " +
           "INNER JOIN users as u on u.id = p.user_id " + 
           "GROUP BY p.id " +
           "ORDER BY COUNT(comment) DESC " + 
           "LIMIT 5 OFFSET ?"
}

function sortByLikes() {
    return "SELECT p.id, p.title, p.text, p.photo, p.like, p.date, u.username, " + 
           "ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count, COUNT(reply) as reply_count " +    
           "FROM posts as p " + 
           "LEFT JOIN post_like_user as l on l.post_id = p.id " +
           "LEFT JOIN comments as c on c.post_id = p.id " +
           "LEFT JOIN replies as r on r.comment_id = c.id " +
           "INNER JOIN users as u on u.id = p.user_id " +  
           "GROUP BY p.id " +
           "ORDER BY p.like DESC " + 
           "LIMIT 5 OFFSET ?"
}

export default router;
