const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let broadcaster;

io.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });

  socket.on("chat", msg => {
    io.emit("chat", msg);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("disconnectPeer", socket.id);
  });
});

server.listen(3000, () => console.log("Server running"));
