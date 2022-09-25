let socket = io.connect("http://localhost:3000");
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let roomInput = document.getElementById("roomName");
let leaveRoom = document.getElementById("leaveRoom")
let screenShot = document.getElementById('scrennShot')
let capturedImg = document.getElementById('photo')
let roomName;
let creator = false;
let rtcPeerConnection;
let userStream;

// Contains the stun server URL we will be using.
let iceServers = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

joinButton.addEventListener("click", function () {
  if (roomInput.value == "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
    socket.emit("join", roomName);
  }
});

leaveRoom.addEventListener("click", function(){
  socket.emit('leave' , roomName)
  capturedImg.style = 'display: none'
  leaveRoom.style = 'display: none'

  if(userVideo.srcObject){
    userVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  if(peerVideo.srcObject){
    peerVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
  });
  }
  if(rtcPeerConnection){
    rtcPeerConnection.onicecandidate = null;
    rtcPeerConnection.ontrack = null;
    rtcPeerConnection.close();
    rtcPeerConnection = null
  }
})

socket.on('leave' , function(){
  if(rtcPeerConnection){
    rtcPeerConnection.ontrack= null
    rtcPeerConnection.onicecandidate = null
    rtcPeerConnection.close()
    rtcPeerConnection = null
  }

  if(peerVideo.srcObject){
    peerVideo.srcObject.getTracks()[0].stop()
    peerVideo.srcObject.getTracks()[1].stop()    
  }
})
//to get screen shot




// Triggered when a room is succesfully created.


socket.on("created", function () {
  creator = true;

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then(function (stream) {
      /* use the stream */
      userStream = stream;
    //   divVideoChatLobby.style = "display:none";
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function (e) {
        userVideo.play();
      };
    })
    .catch(function (err) {
      /* handle the error */
      alert("Couldn't Access User Media");
    });
});

// Triggered when a room is succesfully joined.

socket.on("joined", function () {
  creator = false;

  navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: { width: 320, height: 120 },
    })
    .then(function (stream) {
      /* use the stream */
      userStream = stream;
    //   divVideoChatLobby.style = "display:none";
      userVideo.srcObject = stream;
      userVideo.onloadedmetadata = function (e) {
        userVideo.play();
      };
      socket.emit("ready", roomName);
    })
    .catch(function (err) {
      /* handle the error */
      alert("Couldn't Access User Media");
    });
});

// Triggered when a room is full (meaning has 2 people).

// socket.on("full", function () {
//   alert("Room is Full, Can't Join");
// });

// Triggered when a peer has joined the room and ready to communicate.

socket.on("ready", function () {
  if (creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection
      .createOffer()
      .then((offer) => {
        rtcPeerConnection.setLocalDescription(offer);
        socket.emit("offer", offer, roomName);
      })

      .catch((error) => {
        console.log(error);
      });
  }
});

// Triggered on receiving an ice candidate from the peer.

socket.on("candidate", function (candidate) {
  let icecandidate = new RTCIceCandidate(candidate);
  rtcPeerConnection.addIceCandidate(icecandidate);
});

// Triggered on receiving an offer from the person who created the room.

socket.on("offer", function (offer) {
  if (!creator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers);
    rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
    rtcPeerConnection.ontrack = OnTrackFunction;
    rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
    rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
    rtcPeerConnection.setRemoteDescription(offer);
    rtcPeerConnection
      .createAnswer()
      .then((answer) => {
        rtcPeerConnection.setLocalDescription(answer);
        socket.emit("answer", answer, roomName);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

// Triggered on receiving an answer from the person who joined the room.

socket.on("answer", function (answer) {
  rtcPeerConnection.setRemoteDescription(answer);
});

// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.

function OnIceCandidateFunction(event) {
  console.log("Candidate");
  if (event.candidate) {
    socket.emit("candidate", event.candidate, roomName);
  }
}

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.

function OnTrackFunction(event) {
  peerVideo.srcObject = event.streams[0];
  peerVideo.onloadedmetadata = function (e) {
    peerVideo.play();
};
}


// let socket = io.connect("http://localhost:3000");


// let divVideoChatLobby = document.getElementById("video-chat-lobby");
// let divVideoChat = document.getElementById("video-chat-room");
// let joinButton = document.getElementById("join");
// let userVideo = document.getElementById("user-video");
// let peerVideo = document.getElementById("peer-video");
// let roomInput = document.getElementById("roomName");
// let roomName
// let creator = false;
// let rtcPeerConnection;
// let iceServers = {
//     iceServers: [
//         { urls: "stun:stun.services.mozilla.com"},
//         { urls: "stun:stun1.l.google.com:19302"}
//     ]
// }
// var userStram

// // add event listner when the button join is clicked we want to process a function
// joinButton.addEventListener("click" , function () {
//     // we want to check if there is no room name entered we ask the user to enter the name
//     if (roomInput.value == "") {
//         alert ("please enter a name for the room")
//     }
//     else{
//         //we want here to get the user media
//         roomName = roomInput.value
//         socket.emit("join", roomName)

//     }
// })


// socket.on('created', function(){
//     creator = true
//     navigator.mediaDevices.getUserMedia(
//         {
//         audio: true, 
//         video: true
//     }).then(function(stream){
//          // to be able to access stream everywhere in the code
//         userStram = stream
//         userVideo.srcObject = stream 
//         userVideo.onloadedmetadata = function(){
//             userVideo.play()
//         }
//     }).catch(function(err){
//         alert(err)
//     })
// })

// socket.on("joined", function () {
//     creator = false;
//     navigator.mediaDevices
//     .getUserMedia({
//         audio: true,
//         video: true,
//     })
//     .then(function (stream) {
//         /* use the stream */
//         userStram = stream;
//         userVideo.srcObject = stream;
//         userVideo.onloadedmetadata = function (e) {
//         userVideo.play();
//         };
//         socket.emit("ready", roomName);
//     })
//     .catch(function (err) {
//         /* handle the error */
//         alert("Couldn't Access User Media");
//     });
// });

// socket.on('error', function(){
//     alert('there is an error')
// })

// socket.on('ready' , function(){
//     if(creator){
//         rtcPeerConnection = new RTCPeerConnection(iceServers)
//         rtcPeerConnection.onicecandidate = onIceCanditateFunction;
//         rtcPeerConnection.ontrack = onTrackFunction;
//         // [0] to get audio track and [1] to get video track 
//         rtcPeerConnection.addTrack(userStram.getTracks()[0],userStram)
//         rtcPeerConnection.addTrack(userStram.getTracks()[1],userStram)
//         rtcPeerConnection.createOffer().then(function(offer){
            
//             rtcPeerConnection.setLocalDescription(offer)
//             socket.emit('offer', offer, roomInput.value)
            
//         }).catch(function(error){
//             console.log(error)
//         })
//     }
// })

// socket.on("candidate", function (candidate) {
//     // let icecandidate = new RTCIceCandidate(candidate);
//     // rtcPeerConnection.addIceCandidate(icecandidate);
//     let icecandidate = new RTCIceCandidate(candidate);
//     rtcPeerConnection.addIceCandidate(icecandidate).catch(e=>{
//         console.log(e)
//     })
// });

// socket.on('offer', function (offer){
//     if(!creator){
//         rtcPeerConnection = new RTCPeerConnection(iceServers)
//         rtcPeerConnection.onicecandidate = onIceCanditateFunction;
//         rtcPeerConnection.ontrack = onTrackFunction;
//         // [0] to get audio track and [1] to get video track 
//         rtcPeerConnection.addTrack(userStram.getTracks()[0],userStram)
//         rtcPeerConnection.addTrack(userStram.getTracks()[1],userStram)
//         rtcPeerConnection.setRemoteDescription(offer)
//         rtcPeerConnection.createAnswer().then(function(answer){
//         rtcPeerConnection.setLocalDescription(answer)
//         socket.emit('offer', answer, roomInput.value)
//         }).catch(function(error){
//             console.log(error)
//         })
//     }
// })

// socket.on('answer', function(answer){
//     rtcPeerConnection.setRemoteDescription(answer)
// })


// function onIceCanditateFunction(event){
//     //checks if there is a canditate in this event
//     // if there is a canditate it will call the event canditate with canditate value and room name
//     if(event.candidate){
//         socket.emit('candidate', event.candidate, roomInput.value )
//     }
// }
// function onTrackFunction(event) {
//     peerVideo.srcObject = event.streams[1] 
//     peerVideo.onloadedmetadata = function(){
//         peerVideo.play()
//     }
// }