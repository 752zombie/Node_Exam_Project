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
import { db } from "./database/createConnection.js";

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

io.on('connection', async (socket) => {
  const session = socket.request.session;
  if (!session || !session.isLoggedIn) {
      return;
  }

  console.log(session.user.username, " connected with socketid = ", socket.id);
  console.log("Total connections: ", io.engine.clientsCount);
  
  
  socket.join(session.user.id);
  socket.on('chat message', async (to, msg) => {

    console.log("to: ", to);
    console.log("msg: ", msg);

      try {
          // check if conversation exists and both sender and receiver is a part of it.
          let preparedStatement = await db.prepare("SELECT id FROM conversations WHERE (participant_1 = ? OR participant_2 = ?) AND (participant_1 = ? OR participant_2 = ?)");
          await preparedStatement.bind({1 : session.user.id, 2 : session.user.id, 3 : to, 4 : to});
          let conversation = await preparedStatement.get();

          // conversation does not exist: create conversation and retrieve conversation id
          if (!conversation) {
            preparedStatement = await db.prepare("INSERT INTO conversations (participant_1, participant_2) VALUES (?, ?)");
            await preparedStatement.bind({1 : session.user.id, 2 : to});
            await preparedStatement.run();
            
            preparedStatement = await db.prepare("SELECT id FROM conversations WHERE (participant_1 = ? OR participant_2 = ?) AND (participant_1 = ? OR participant_2 = ?)");
            await preparedStatement.bind({1 : session.user.id, 2 : session.user.id, 3 : to, 4 : to});
            conversation = await preparedStatement.get();
          }

          preparedStatement = await db.prepare("INSERT INTO messages (conversation_id, sender_id, receiver_id, text) VALUES (?, ?, ?, ?) ");
          await preparedStatement.bind({1 : conversation.id, 2 : session.user.id, 3 : to, 4 : msg});
          await preparedStatement.run();
          socket.to(parseInt(to)).emit("chat message", {sender : session.user.username, text : msg, conversationId : conversation.id, senderId : session.user.id});
          

      }

      catch(err) {
          //TODO: some error handling
      }
      
      
    
    });

    socket.on("disconnect", () => {
        console.log(socket.request.session.user.username, " disconnected with socketId = ", socket.id);
    })
  });


  
  
httpServer.listen(8080, () => {
    console.log("Server is running on port 8080");
});
