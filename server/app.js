import express from "express";
import bodyParser from 'body-parser'
import path from "path";
import loginRouter from "./routers/loginRouter.js";
import session from "express-session";
import posts from './routers/posts.js'
import comments from './routers/comments.js'
import likes from './routers/likes.js'

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

app.use(express.static(path.resolve('../client/public')));

app.get("*", (req, res) => {
    res.sendFile(path.resolve('../client/public/index.html'));
})

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));

io.use((socket, next) => {
  console.log("my middleware");
})

io.use((socket, next) => {
  const session = socket.request.session;

  if (!session || !session.isLoggedIn) {
    return;
  }
  
  next();
})

io.on('connection', (socket) => {
    socket.on('chat message', (user, msg) => {
    
      //TODO: check if existing conversation already exists (from db)

      //TODO: if exists -> load existing conversation and create a socket room

      //TODO: else -> create new conversation, save to db and create new socket room

      //TODO: once connection established -> use socket room to send and receive messages and save them in db

      console.log(user);
      console.log(msg);
      io.emit('chat message', msg);
    });
  });
  
  
httpServer.listen(8080, () => {
    console.log("Server is running on port 8080");
});
