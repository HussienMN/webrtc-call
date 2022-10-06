<template>
    <div>
        <div v-if="!joined" class="">
                <div class="form">
                    <label for="fname">{{roomnamelabel}}</label>
                    <input class="lable" type="text" v-model="roomName"  />
                    <label for="lname">{{usernamelabel}}</label>
                    <input class="lable" type="text" v-model="userName" />
                    <button class="btn" v-on:click="call">Call</button>
                </div> 
        </div>  
        
        <div class="videoStream" v-if="joined">
            <h3>Welcome to <b>{{roomName}}</b>!</h3>
            <video class="local-stream" ref="peerVideo" id="peerVideo" v-if="!isAudio"></video>
            <video class="remote-stream" ref="userVideo" id="userVideo" v-if="!isAudio"></video> 
            
            <div class="controls">
                <button v-on:click="leave">
                    <img src="../assets/endcall.png"/>
                </button>
                <button v-on:click="screenShot" v-if="this.doselfie">
                    <img src="../assets/selfie.png" />
                </button>
                <button id="muteBtn" v-on:click="doMute" v-if="!muteBtn" title="mute" >
                    <img src="../assets/unmuteButton.png"/>           
                </button> 
                <button id="muteBtn" v-on:click="unMute" v-if="muteBtn" title="ummute">
                    <img src="../assets/muteButton.png"/>           
                </button>                 
                <button id="hideCamBtn" v-on:click="hideCam" v-if=" ! hideCamBtn" title="hide camera">
                    <img src="../assets/hideCam.png"/>           
                </button> 
                <button id="hideCamBtn" v-on:click="showCam" v-if="hideCamBtn" title="show camera">
                    <img src="../assets/unhideCam.png"/>           
                </button>
                <button v-if="SHButton" v-on:click="screenShotDelete">
                    <img src="../assets/delete.png"/>           
                </button>                                 
            </div>
            <div class="container" id="container">
                <canvas ref="canvas" id="canvas"> </canvas>
            </div>     
        </div>
    </div>







    <div class="grid-container">        
        <div class="item4" v-if="joined && dochat"> 
                <textarea v-model="msg" class="chatMsg" ref="msg" id="msg"></textarea>
                <button v-on:click="sendMsg">send</button>
                <div 
                    v-for="message in messages" 
                    v-bind:key="message"
                    class="chat-box"
                    >
                    <b class="uname">-{{message.user}}:</b> <p class="txtmsg" id="textmsg">{{message.msgText}}</p>
                </div>
            </div>                
    </div>
    
</template>

<script>
import io from 'socket.io-client'

export default {
    name: 'webrtcComponent',
    data: function(){
        return{
            joined: false,
            creator: false,
            joinedChat: false,            
            roomName: '',
            userName: '',            
            socketInsance: null,
            userStream: null,
            remoteStream: null,
            userVideo: null,
            peerVideo: null,
            userAudio: null,
            peerAudio: null,
            rtcPeerConnection: null,
            rtcDataChannel: null,
            canvas: null,
            SHButton : false,
            isAudio: this.isAudio,
            senders: [],
            iceServers : {
                iceServers: [
                    { urls: "stun:stun.services.mozilla.com" },
                    { urls: "stun:stun.l.google.com:19302" },
                ],  
            },             
            msg: '',
            messages: [],
            muteBtn: false,
            hideCamBtn: false,
        }
    },
    props: {
        socketurl: {
            type: String,
            default: 'http://localhost:4000'
        }, 
        isAudio: {
            type: Boolean,
            default: false
        },
        roomnamelabel:{
            type: String,
            default: 'Room Name'
        },
        usernamelabel:{
            type: String,
            default: 'User Name'
        },
        videoheight: {
            type: [String, Number],
            default: 420
        },
        videowidth: {
            type: [String, Number],
            default: 420
        },
        doselfie: {
            type: Boolean,
            default: false
        },
        isShareScreen: {
            type: Boolean,
            default: false
        },
        dochat: {
            type: Boolean,
            default: false
        }                 
    },
    methods: {
        call: function(){
            if(this.roomName =='' || this.roomName == ' ' || this.roomName ==undefined  || this.userName =='' || this.userName == ' ' || this.userName ==undefined ){
                alert('enter a vailed username and room name !')
            }else{
                this.joined = true
                this.socketInsance.emit('call' , this.roomName)
            }          
        },
        createRoom: function(){
            this.creator = true
            this.joined = true
                this.userStream = navigator.mediaDevices.getUserMedia({
                video: {
                    width: this.videowidth,
                    height: this.videoheight
                },
                audio: true
            }).then (function(stream){
                let localPeer = this.$el.parentNode.getElementById('peerVideo')
                this.userStream = stream
                localPeer.srcObject = stream
                localPeer.onloadedmetadata = function(e){
                    localPeer.play()
                }
            }.bind(this))
            .catch (function(err){
                console.log(err)
            }) 
        },
        joinRoom: function(){
            this.creator = false
            this.joined = true
                this.userStream = navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: this.videowidth,
                    height: this.videoheight
                }
            }).then (
                function (stream){
                this.userStream = stream
                let remotePeer = this.$el.parentNode.getElementById('peerVideo')
                remotePeer.srcObject = stream
                remotePeer.onloadedmetadata = (e)=>{
                    remotePeer.play()
                }
                this.socketInsance.emit("ready", this.roomName)                     
            }.bind(this)
            )
            // socketInsance = this.socketInsance
        },
        leave: function(){
            this.socketInsance.emit("leave", this.roomName)
            if(!this.isAudio){
                this.userStream.getTracks().forEach((track) => {
                track.stop();   
                });
            }else if(this.isAudio){
                this.userStream.getTracks().forEach((track) => {
                track.stop();   
                });
            }

            if(!this.isAudio){
                this.userStream.getTracks().forEach((track) => {
                track.stop();
            });
            }else if(this.isAudio){
                this.userStream.getTracks().forEach((track) => {
                track.stop();
            });
            }

            if(this.rtcPeerConnection){
                this.rtcPeerConnection.onicecandidate = null;
                this.rtcPeerConnection.ontrack = null;
                this.rtcPeerConnection.close();
                this.rtcPeerConnection = null
            }    
            this.joined = false
            this.joinedChat = false            
            this.roomName = ''        
            this.userName = ''        
        },
        ready: function(){
            if(this.creator){
                let localPeer = this.$el.parentNode.getElementById('userVideo')

                this.rtcPeerConnection = new RTCPeerConnection(this.iceServers)
                this.rtcPeerConnection.onicecandidate = (event)=>{
                    console.log("candidate")
                    console.log(event.candidate)
                    if(event.candidate){
                    console.log('from on track function')
                        this.socketInsance.emit("candidate", event.candidate, this.roomName)                
                    }
                }
                this.rtcPeerConnection.ontrack = (event)=>{
                    localPeer.srcObject = event.streams[0];                    
                    localPeer.onloadedmetadata = function(e){
                        localPeer.play()
                    }    
                }
                this.rtcPeerConnection.addTrack(this.userStream.getTracks()[0], this.userStream);
                this.rtcPeerConnection.addTrack(this.userStream.getTracks()[1], this.userStream);                 
                this.rtcPeerConnection.createOffer()
                    .then(function(offer){
                        this.rtcPeerConnection.setLocalDescription(offer)
                        this.socketInsance.emit("offer" , offer, this.roomName)                           
                    }.bind(this)).catch(err=>{
                        console.log(err)
                    })
            }            
        },
        offer: function(offer){
            if(!this.creator){
                let remotePeer = this.$el.parentNode.getElementById('userVideo')

                this.rtcPeerConnection = new RTCPeerConnection(this.iceServers)
                this.rtcPeerConnection.onicecandidate = (event)=>{
                    console.log("candidate")
                    console.log(event.candidate)
                    if(event.candidate){
                        console.log('from on track function')
                        this.socketInsance.emit("candidate", event.candidate, this.roomName)                
                    }
                }
                this.rtcPeerConnection.ontrack = (event)=>{
                    remotePeer.srcObject = event.streams[0];                    
                    console.log('from on track function')
                    remotePeer.onloadedmetadata = function(e){
                        remotePeer.play()
                    }    
                }
                // this.rtcPeerConnection.addTrack(this.userStream.getTracks()[0], this.userStream);
                this.rtcPeerConnection.addTrack(this.userStream.getTracks()[1], this.userStream);
                this.rtcPeerConnection.setRemoteDescription(offer);
                                console.log('offer okay')
                this.rtcPeerConnection.createAnswer()
                    .then( function(answer){
                        this.rtcPeerConnection.setLocalDescription(answer)
                        this.socketInsance.emit("answer", answer, this.roomName)
                    }.bind(this)).catch(err=>{
                        console.log(err)
                    })
            }            
        },
        candidate: function(candidate){
            let icecandidate = new RTCIceCandidate(candidate);
            this.rtcPeerConnection.addIceCandidate(icecandidate);
            console.log(candidate)             
        },
        sendMsg: function(){
                this.addMsg()
                this.$refs.msg.focus()
                this.msg = ''
        },
        addMsg: function(){
            this.$refs.msg.focus()
            let msg= document.getElementById('msg')

            const message = {
                msgText: this.msg,
                user: this.userName
            }

                if(this.msg == null || this.msg== '' || this.msg == ' '){
                    alert('enter a message text')
                }else {
                    this.messages = this.messages.concat(message)
                    // this.rtcDataChannel.send(message)
                    this.socketInsance.emit('message', message)
                                    
                }
            
        },
        startChat: function(data){
            this.joinedChat = true
            this.messages = this.messages.concat(data)
        },
        screenShot: function(){
            if(this.$refs.peerVideo) {
                this.$refs.canvas.width = this.videowidth
                this.$refs.canvas.height = this.videoheight
                this.SHButton = true 
                this.$refs.canvas.getContext('2d').drawImage(this.$refs.peerVideo, 0, 0 , this.$refs.peerVideo.videowidth, this.$refs.peerVideo.videoheight)
            }else{
                alert('error')
            }               
        },
        screenShotDelete: function(){
            this.$refs.canvas.getContext('2d').clearRect(0, 0, this.videowidth, this.videoheight)
            this.SHButton = false
        },
        doMute: function(){
            this.muteBtn = true
            this.$refs.peerVideo.srcObject.getTracks()[0].enabled = false
        },
        unMute: function(){
            this.muteBtn = false
            this.$refs.peerVideo.srcObject.getTracks()[0].enabled = true
        },
        hideCam: function(){
            this.hideCamBtn = true
            this.$refs.peerVideo.srcObject.getTracks()[1].enabled = false
        },
        showCam: function(){
            this.hideCamBtn = false
            this.$refs.peerVideo.srcObject.getTracks()[1].enabled = true
        },        
        ShareScreen: function(){
            this.joined = true
            this.rtcPeerConnection = new RTCPeerConnection(this.iceServers)
            let userStream = this.userStream
            this.senders = []
            let x = []
            x = this.senders 
            userStream.getTracks().forEach( function(track) {
                this.senders.push(this.rtcPeerConnection.addTrack(track, userStream))
            }.bind(this))
            console.log('the senders:',this.senders)
            navigator.mediaDevices.getDisplayMedia({ 
                audio: true ,
                video: {
                    width: this.videowidth,
                    height: this.videoheight
            }}).then( function(stream){
                const shareScreenTrack  = stream.getTracks()[0]
                this.isShare = true
                x.find(sender => sender.track.kind === 'video').replaceTrack(shareScreenTrack);
            shareScreenTrack.onended = function(){
                x.find(sender => sender.track.kind === 'video').replaceTrack(userStream.getTracks()[1])
            }
            }.bind(this), function(error){
                alert('error')
            });
        }      
    },
    created: function(){
    },
    mounted() {
        this.socketInsance = io(this.socketurl)
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers)
        this.rtcDataChannel = this.rtcPeerConnection.createDataChannel('channel')
        this.userVideo = document.getElementById('userVideo')
        this.peerVideo = document.getElementById('peerVideo')
        this.peerAudio = document.getElementById('peerAudio')
        this.userAudio = document.getElementById('userAudio')

        this.canvas = document.getElementById('canvas')
        
        this.socketInsance.on('leave' , function(){

        if(this.rtcPeerConnection){
            this.rtcPeerConnection.ontrack= null
            this.rtcPeerConnection.onicecandidate = null
            this.rtcPeerConnection.close()
            this.rtcPeerConnection = null
        }

        if(peerVideo.srcObject){
            peerVideo.srcObject.getTracks()[0].stop()
            peerVideo.srcObject.getTracks()[1].stop()
        }
        })
        
        this.socketInsance.on("create-room", function(){
            this.createRoom()
        }.bind(this))

        this.socketInsance.on("join-room", function(){
            this.joinRoom()
        }.bind(this))

        this.socketInsance.on("ready", function(){ 
            this.ready()
        }.bind(this))

        this.socketInsance.on("candidate",  function(candidate){
            this.candidate(candidate)
        }.bind(this))

        this.socketInsance.on("offer", function(offer){
            this.offer(offer)
        }.bind(this))

        this.socketInsance.on("answer", function(answer){
            this.rtcPeerConnection.setRemoteDescription(answer)
        }.bind(this))

        // this.rtcDataChannel.onmessage = (event) => {
        //     document.getElementById('textmsg').innerHTML += event.data
        // };
        // this.rtcDataChannel.onopen = function(){
        //     var msg = document.getElementById('message').value
        //     document.getElementById('textmsg').innerHTML += msg
        //     rtcDataChannel.send(msg)
        // }

        this.socketInsance.on('message:received', function(data){
            this.startChat(data)
        }.bind(this))        
    }
}
</script>

<style>
.video-call{
    display: grid;
}
* {
    box-sizing: border-box;
}
.grid-container {
    display: grid;
    grid-template-columns: auto auto auto auto ;
    grid-gap: 5px;
    /* background-color: ; */
    padding: 0px;
}

.grid-container > div {
    text-align: center;
    padding: 0px 0;
    font-size: 18px; 
    overflow: scroll;
}
.item1 {
    grid-column: 1 / 5;
    height: 120px;
}
.item2 {
    height: 430px;
}
.item3 {
    grid-area:  2/2/2/4;
    height: 430px;
    min-width: -webkit-fill-available;
}
.item4 {
    height: 430px;
    text-align: left;
}
.chatMsg{
    width: 100%;
    border-radius: 8px;
}
.chat-box{
    text-align: left;
    background-color: rgb(217, 234, 235);
    border-radius: 8px;
}
.form 
{
    padding: 10px;
    margin-left: 35%;
    margin-right: 35%;
}
input[type=text]
{
    width: 100%;
    /* padding: 7px 10px; */
    /* margin: 6px 0; */
    display: inline-block;
    border-radius: 4px;
    font-size: 15px;
}
.label
{
    font-size: 20px;
}
.btn{
    width: 100%;
    margin-top: 10px;
}
.uname{
    color: rgb(131, 14, 14);
    font-size: 15px;
}
.txtmsg{
    color: black;
}
@media screen and (max-width: 600px) {
.item1 { width: 100%; }
.item3 { width: 100%; grid-area: 2/2/2/5 }
.item4 {width: 100%; height: 5rem; margin-top: 0px; grid-area: 3/1/3/5}

}
.videoStream {
    position: relative;
    margin: 0px auto;
    background-color: rgba(255 255 255 / 30%);
    overflow: visible;
    border-radius: 8px;
}
.videoStream .local-stream {
    width: 100%;
    height: 50%;
    border-radius: 8px;
}
.videoStream .remote-stream {
    width: 50%;
    height: 25%;
    position: inherit;
    bottom: 0;
    left: 0%;
    border-radius: 8px;
}
.videoStream .controls {
    position: relative;
    bottom: 0;
    right: 0;
    margin-right: 20px;
    margin-bottom: 10px;
}
.videoStream .controls button {
    border: 0 none;
    padding: 6px 9px;
    border-radius: 50%;
    margin-right: 6px;
    margin-bottom: 0px; 
}
.container {
    position: relative;
    width: 100%;
    }
.container canvas {
    width: 100%;
    height: auto;
    border-radius: 5px;
}
.material-icons.md-18 {
    font-size: 18px;
}
    .material-icons.md-24 {
    font-size: 24px;
}
.material-icons.md-36 {
    font-size: 36px;
}
.material-icons.md-48 {
    font-size: 48px;
}
</style>