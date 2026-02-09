const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ================= LIVE STREAM STATE ================= */
let isLive = false;
let broadcaster = null;

/* ================= SOCKET SYSTEM ================= */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Tell users if someone is live
  socket.emit("liveStatus", isLive);

  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    isLive = true;
    io.emit("liveStatus", true);
  });

  socket.on("watcher", () => {
    if (broadcaster) {
      io.to(broadcaster).emit("watcher", socket.id);
    }
  });

  socket.on("offer", (id, message) => {
    io.to(id).emit("offer", socket.id, message);
  });

  socket.on("answer", (id, message) => {
    io.to(id).emit("answer", socket.id, message);
  });

  socket.on("candidate", (id, message) => {
    io.to(id).emit("candidate", socket.id, message);
  });

  socket.on("streamEnded", () => {
    isLive = false;
    broadcaster = null;
    io.emit("liveStatus", false);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */
server.listen(3000, () =>
  console.log("Server running on port 3000")
);
