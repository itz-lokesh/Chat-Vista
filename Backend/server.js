import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import path from "path";
import { Server } from "socket.io";
import updateUserOnlineStatus from "./controllers/userStatusUpdater.js";

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json data

// app.get("/", (req, res) => {
//   res.send("API Running!");
// });

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true, // Uncomment if necessary
  },
});

io.on("connection", async (socket) => {
  console.log("Connected to socket.io");
  let userId;
  // on setup pr "user" bheja gya h
  socket.on("setup", async (userData) => {
    socket.join(userData._id);
    userId = userData._id;
    socket.emit("connected");
    await updateUserOnlineStatus(userId, true, io);
  });

  // client side se emit "join chat" , room = {chatId}
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("delete message", (deletedMessage) => {
    var chat = deletedMessage.chat;

    // Check if chat exists and users are defined
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == deletedMessage.sender._id) return;

      socket.in(user._id).emit("message deleted", deletedMessage);
    });
  });

  socket.on("disconnect", async () => {
    if (userId) {
      console.log("USER DISCONNECTED");
      socket.leave(userId);

      await updateUserOnlineStatus(userId, false, io);
    }
  });
});
