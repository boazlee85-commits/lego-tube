const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

let broadcaster;

io.on("connection", socket => {

  // Streamer starts
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });

  // Viewer joins
  socket.on("watcher", () => {
    if (broadcaster) {
      socket.to(broadcaster).emit("watcher", socket.id);
    }
  });

  // WebRTC signals
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });

  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });

  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("disconnectPeer", socket.id);
  });

});

server.listen(3000, () => console.log("Server running"));
