import { Router } from "express";
import { db } from "../database/createConnection.js";

const router = Router();

router.post("/post", async (req, res) => {
    
    try {
        req.session.isLoggedIn = true;
        const user = req.session.user;

        console.log(user);

        const preparedStatement = await db.prepare("INSERT INTO posts (title, text, photo, date, user_id) VALUES (?, ?, ?, ?, ?)");
        await preparedStatement.bind({1 : req.body.title, 2 : req.body.text, 3 : req.body.photo, 4 : req.body.date, 5 : user.id});
        await preparedStatement.run();
                
        res.send({result : "success"});
    
    } 
    
    catch(err) {
        console.log(err.message);
        res.send({ result : "Could not send post to server"});
    }
})


router.get("/post/:id", async (req, res) => {
    
    try { 
        const preparedStatement = await db.prepare("SELECT * FROM posts WHERE id = ?");
        await preparedStatement.bind({1 : req.params.id});
        const post = await preparedStatement.all();
        
        res.send({result : "success", post : post[0]});
    
    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
    }    

})

// This function collects the Post & boolean 
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
        
        //retrieve Posts from db and check for Likes from User
        const preparedStatement = await db.prepare("SELECT p.id, p.title, p.text, p.photo, p.like, p.date, ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count  " +    
                                                    "FROM posts as p " + 
                                                    "LEFT JOIN post_like_user as l on l.post_id = p.id " +
                                                    "LEFT JOIN comments as c on c.post_id = p.id " +                                                    
                                                    "GROUP BY p.id " + 
                                                    "ORDER BY p.date DESC " +
                                                    "LIMIT 5 OFFSET ?");
        await preparedStatement.bind({1 : offset});
        const posts = await preparedStatement.all();

        //send retrieved Posts
        res.send({result : "success", posts : posts});

    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})


// This function returns Posts based on sort call
// This function collects the Post & boolean 
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

        // Sets sorting condition based on req.body 
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

        //send retrieved Posts
        console.log(posts)
        res.send({result : "success", posts : posts});

    } 
    
    catch (err) {
        console.log(err.message)
        res.send({result : "Could not get the post"})
}     
})

function sortByComments() {
    return "SELECT p.id, p.title, p.text, p.photo, p.like, p.date, ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count  " +    
            "FROM posts as p " + 
            "LEFT JOIN post_like_user as l on l.post_id = p.id " +
            "LEFT JOIN comments as c on c.post_id = p.id " + 
            "GROUP BY p.id " +
            "ORDER BY COUNT(comment) DESC " + 
            "LIMIT 5 OFFSET ?"
}

function sortByLikes() {
    return "SELECT p.id, p.title, p.text, p.photo, p.like, p.date, ifnull(l.user_id, 0) as liked, COUNT(comment) as comment_count  " +    
           "FROM posts as p " + 
           "LEFT JOIN post_like_user as l on l.post_id = p.id " +
           "LEFT JOIN comments as c on c.post_id = p.id " + 
           "GROUP BY p.id " +
           "ORDER BY p.like DESC " + 
           "LIMIT 5 OFFSET ?"
}

export default router;
