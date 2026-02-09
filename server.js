const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* STORAGE */
let users = {};
let channels = {};
let liveChats = [];

/* FILE UPLOAD */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

app.post("/upload", upload.fields([{name:"video"},{name:"thumb"}]), (req,res)=>{
  const { user, title } = req.body;
  if(!channels[user]) channels[user]={name:user,subs:0,videos:[]};
  channels[user].videos.push({
    name:title,
    video:"/uploads/"+req.files.video[0].filename,
    thumb:"/uploads/"+req.files.thumb[0].filename,
    views:0,
    likes:0,
    comments:[]
  });
  res.json({status:"ok"});
});

app.get("/channels", (req,res)=>res.json(channels));

/* SOCKET LIVE SYSTEM */
io.on("connection", socket=>{
  socket.on("liveChat", msg=>{
    liveChats.push(msg);
    io.emit("liveChat", msg);
  });

  socket.on("viewerJoin", ()=>{
    io.emit("viewerCount");
  });
});

server.listen(3000, ()=>console.log("Server running on http://localhost:3000"));
