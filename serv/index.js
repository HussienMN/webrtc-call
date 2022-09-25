const express = require("express");
const socket = require("socket.io");

var app = express();

let server = app.listen(4000 , function () {
  console.log("Listening to Port 4000");
});
app.use(express.static("public"));

var io = socket(server, {
  cros: {
    origin: '*',
    methods: ['POST','GET']
  }
});
io.on("connection", function(socket){
  console.log(`user ${socket.id} connected`)

  socket.on("call" , function(roomName){
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);
    if(room == undefined){
      socket.join(roomName)
      socket.emit('create-room')
    }else if (room.size >= 1){
      socket.join(roomName)
      socket.emit('join-room')
    } else {
      alert('busy!')
      socket.emit('error')
    }
    console.log("the rooms: "+rooms)

  })
  socket.on('ready', function (roomName){

    socket.broadcast.to(roomName).emit('ready')
  })
  socket.on('candidate', function (candidate, roomName){
    console.log(candidate)
    socket.broadcast.to(roomName).emit('candidate', candidate)    
  })
  socket.on('offer', function (offer , roomName){
    socket.broadcast.to(roomName).emit('offer', offer)
  })
  socket.on('answer', function (answer , roomName){
    socket.broadcast.to(roomName).emit('answer', answer)
  })
  socket.on('message', function(data){
    socket.broadcast.emit('message:received', data)
  })
  socket.on('leave', function(roomName){
    socket.leave(roomName)
    socket.broadcast.to(roomName).emit('leave')
  }) 
})
// upgradedServer.on("connection", function (socket) {
//   socket.on("sendingMessage", function (data) {
//     upgradedServer.emit("broadcastMessage", data);
//   });

//   console.log("Websocket Connected", socket.id);
// });