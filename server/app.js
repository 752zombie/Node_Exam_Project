import express from "express";
import bodyParser from 'body-parser'
import path from "path";
import "dotenv/config"
import loginRouter from "./routers/loginRouter.js";
import session from "express-session";
import postsRouter from './routers/postsRouter.js'
import commentsRouter from './routers/commentsRouter.js'
import likesRouter from './routers/likesRouter.js'
import messagesRouter from "./routers/messagesRouter.js";
import chat from "./sockets/chat.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
})

app.use(sessionMiddleware);

app.use(loginRouter);
app.use(postsRouter);
app.use(commentsRouter);
app.use(likesRouter);
app.use(messagesRouter);

app.use(express.static(path.resolve('../client/public')));

app.get("*", (req, res) => {
    res.sendFile(path.resolve('../client/public/index.html'));
})

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));


io.use((socket, next) => {
    const session = socket.request.session;

    if (!session || !session.isLoggedIn) {
        next(new Error("you need to be logged in"));
    }

    else {
        next();
    }
})

io.on('connection', async (socket) => {
    const session = socket.request.session;
    
    if (!session || !session.isLoggedIn) {
        return;
    }

    console.log(session.user.username, " connected with socketid = ", socket.id);
    console.log("Total connections: ", io.engine.clientsCount);


    socket.join(session.user.id);
    socket.on('chat message', chat(socket, session));

    socket.on("disconnect", () => {
        console.log(socket.request.session.user.username, " disconnected with socketId = ", socket.id);
    })
  });
 
  
httpServer.listen(8080, () => {
    console.log("Server is running on port 8080");
});
