const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// THIS MAKES HTML FILES WORK
app.use(express.static("public"));

let streamerSocket = null;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("start-stream", () => {
    streamerSocket = socket.id;
    socket.broadcast.emit("stream-started");
  });

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    if (socket.id === streamerSocket) {
      streamerSocket = null;
      socket.broadcast.emit("stream-ended");
    }
  });
});

server.listen(3000, () => console.log("Server running"));
