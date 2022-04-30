import express from "express";
import bodyParser from 'body-parser'
import path from "path";
import loginRouter from "./routers/loginRouter.js";
import session from "express-session";
import posts from './routers/posts.js'
import comments from './routers/comments.js'
import likes from './routers/likes.js'
import messagesRouter from "./routers/messagesRouter.js";

import { createServer } from "http";
import { Server } from "socket.io";



const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.json());

const sessionMiddleware = session({
  secret: "test",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
})

app.use(sessionMiddleware);

app.use(loginRouter);
app.use(posts);
app.use(comments);
app.use(likes);
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

io.on('connection', (socket) => {
  const session = socket.request.session;
  if (!session || !session.isLoggedIn) {
      return;
  }

  console.log(session.user.username, " connected with socketid = ", socket.id);
  console.log("Total connections: ", io.engine.clientsCount);
  
  
  socket.join(session.user.username);
    socket.on('chat message', (to, msg) => {

//      console.log("to: ", to);

  //  console.log(session.user.username, " :", socket.rooms);
    
      
      //TODO: check if existing conversation already exists (from db)

      //TODO: if exists -> load existing conversation and create a socket room

      //TODO: else -> create new conversation, save to db and create new socket room

      //TODO: once connection established -> use socket room to send and receive messages and save them in db

      
      socket.to(to).emit("chat message", {from : session.user.username, message : msg});
    
    });

    socket.on("disconnect", () => {
        console.log(socket.request.session.user.username, " disconnected with socketId = ", socket.id);
    })
  });


  
  
httpServer.listen(8080, () => {
    console.log("Server is running on port 8080");
});
