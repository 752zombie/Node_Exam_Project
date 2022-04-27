import express from "express";
import path from "path";
import loginRouter from "./routers/loginRouter.js";
import session from "express-session";
import posts from './routers/posts.js'

import { createServer } from "http";
import { Server } from "socket.io";



const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());

app.use(session({
    secret: "test",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(loginRouter);
app.use(posts);

app.use(express.static(path.resolve('../client/public')));

app.get("*", (req, res) => {
    res.sendFile(path.resolve('../client/public/index.html'));
})

io.on('connection', (socket) => {
    socket.on('chat message', msg => {
      io.emit('chat message', msg);
    });
  });
  
  
httpServer.listen(8080, () => {
    console.log("Server is running on port 8080");
});
