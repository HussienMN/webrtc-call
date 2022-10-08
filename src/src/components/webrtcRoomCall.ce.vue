<template>
    <div class="videoStream">
        <div id="board" v-if="isStreaming">
            <p ref="peerID">Your Peer ID: {{this.peerID}}</p>
            <div v-if="isJoined">
                <input type="text" placeholder="Room Name" ref="roomName" v-model="roomName">
                <button ref="joinRoom" v-on:click="joinRoom" class="btn">
                    <img src="../assets/conferencecall.png"/> 
                </button>
                <button ref="leaveRoom" v-on:click="leaveRoom" class="btn">
                    <img src="../assets/endcall.png"/> 
                </button>
                <button  v-on:click="screenShot" v-if="doselfie">screenshot</button>
            </div>             
        </div>

        <!-- wird das lokale Stream gerendert  -->
        <div class="local-stream">
            <video ref="localVideo" v-if="isStreaming"></video> 
        </div>

        <div class="controls">
            <button v-on:click="startStream" v-if="!isStreaming" title="start stream">
                <img src="../assets/call.png"/>
            </button>
            <button id="btn2" v-on:click="stopStream" v-if="isStreaming" title="leave">
                <img src="../assets/streamOff.png"/>
            </button>
            <button id="btn3" v-on:click="screenShot" v-if="isStreaming" title="selfie">
                <img src="../assets/selfie.png"/>           
            </button>
            <button id="muteBtn" v-on:click="doMute" v-if="isStreaming && ! muteBtn" title="mute" >
                    <img src="../assets/muteButton.png"/>           
                </button> 
                <button id="muteBtn" v-on:click="unMute" v-if="isStreaming &&  muteBtn" title="ummute">
                    <img src="../assets/unmuteButton.png"/>           
                </button>                 
                <button id="hideCamBtn" v-on:click="hideCam" v-if="isStreaming && ! hideCamBtn" title="hide camera">
                    <img src="../assets/hideCam.png"/>           
                </button> 
                <button id="hideCamBtn" v-on:click="showCam" v-if="isStreaming && hideCamBtn" title="show camera">
                    <img src="../assets/unhideCam.png"/>           
                </button>             
            <button v-on:click="screenShotDelete" v-if="SHButton" title="delete img">
                <img src="../assets/delete.png"/>
            </button>                                              
        </div>          
        <!-- hier werden Video Elemente bei einem Betritt hinzugefügt -->
        <div class="remote-streams" ref='remoteVideo' id="remoteVideo">

        </div>  

        <canvas ref="canvas" v-if="isStreaming"></canvas> 
        <canvas ref="canvas" v-if="doselfie && SHButton"></canvas>                
    </div>
</template>

<script>
import Peer from 'skyway-js'

export default {
    name: 'webrtcMultiCall',
    inheritAttrs: false,
    data: function(){
        return {
            Peer: this.Peer,
            isJoined: false,
            peerID: null,
            roomName: this.roomName,
            remoteStream: null,
            roomMode: null,
            isStreaming: false,
            SHButton : false,
            localStream: null,
            konferenzRaum: null,
            muteBtn: false,
            hideCamBtn: false,
        }
    },
    props:{
        peerapikey:{
            type: String,
            required: true
        },
        roomname:{
            type: String,
        },
        videoheight: {
            type: [Number, String],
            default: 400
        },
        videowidth: {
            type: [Number, String],
            default: 400
        },        
        doselfie: {
            type: Boolean,
            default: false
        },
        doShareScreen: {
            type: Boolean,
            default: false
        }
    },
    mounted(){
        this.Peer = new Peer({
            key: this.peerapikey,
            debug: 3
        })
        this.Peer.on('open', function(){
            this.peerID = this.Peer.id
        }.bind(this))
    },
    methods:{
        getRoomHash: function(){
            location.hash === sfu  
        },
        startStream: function(){
            this.isJoined = true
            this.isStreaming = true
            this.localStream = navigator.mediaDevices.getUserMedia({
                video: {
                    width: this.videowidth,
                    height: this.videoheight
                },
                audio: true
            }).then(function(stream){
                this.$refs.localVideo.srcObject = stream
                this.$refs.localVideo.play()
                this.localStream = stream
            }.bind(this)).catch( function(error){
                console.log(error)
                return
            })            
        },
        stopStream: function(){
            this.isStreaming = false
            this.isJoined = false
            this.$refs.localVideo.srcObject.srcObject = null;
            this.Peer = null 
        },        
        joinRoom: function(){
            this.isStreaming = true
            if (this.roomName == null || this.roomName == '' || this.roomName == ' ') {
                alert('enter a room name')
            } else {
                this.konferenzRaum = this.Peer.joinRoom(this.roomName, {
                mode: this.getRoomHash,
                stream : this.localStream
            })
            // alert(this.roomName)
                if (!this.Peer.open) {
                    return;
                }   
                this.konferenzRaum.once('open', ()=>{
                    let paraElement =  document.createElement('p')
                    paraElement.setAttribute('ref', 'peerID')
                    paraElement.innerHTML = `you are joined at: <b>${this.roomName}</b>`
                    this.$el.parentNode.getElementById('board').append(paraElement)
                })

                this.konferenzRaum.on('stream', (stream)=>{
                    let videoElement = document.createElement('video')
                    videoElement.setAttribute('id', 'videoElement');
                    videoElement.setAttribute('class', 'member');
                    console.log('parent node', this.$el.parentNode)
                    this.$el.parentNode.getElementById('remoteVideo').append(videoElement)
                    videoElement.srcObject = stream;
                    videoElement.playsInline = true;
                    this.remoteStream = stream
                    videoElement.play()
                }) 
            }
        },
        leaveRoom: function(){
            this.konferenzRaum.close()
            if(this.konferenzRaum.once('open', ()=>{})){
                this.$refs.localVideo.srcObject.getTracks().forEach(track => track.stop());
                this.$refs.localVideo.srcObject.srcObject = null;
                console.log('you left')
                this.$refs.peerID = '',
                this.isJoined = false
                this.isStreaming = false
                this.Peer = null 
            }else{
                alert('you are not joined')
            }
        },
        screenShot: function(){
            if(this.$refs.localVideo.srcObject !=null){
                this.SHButton = true                
                this.$refs.canvas.width = this.videowidth
                this.$refs.canvas.height = this.videoheight
                this.$refs.canvas.getContext('2d').drawImage(this.$refs.localVideo ,0, 0 , this.videowidth, this.videoheight)
            }else{
                alert('there is no streaming')
            } 
        },
        screenShotDelete: function(){
            this.$refs.canvas.getContext('2d').clearRect(0, 0, this.videowidth, this.videoheight)
            this.SHButton = false
        },
        doMute: function(){
            this.muteBtn = true
            this.$refs.localVideo.srcObject.getTracks()[0].enabled = false
        },
        unMute: function(){
            this.muteBtn = false
            this.$refs.localVideo.srcObject.getTracks()[0].enabled = true
        },
        hideCam: function(){
            this.hideCamBtn = true
            this.$refs.localVideo.srcObject.getTracks()[1].enabled = false
        },
        showCam: function(){
            this.hideCamBtn = false
            this.$refs.localVideo.srcObject.getTracks()[1].enabled = true
        },                   
        shareScreen: function(){
            navigator.mediaDevices.getDisplayMedia({ 
                audio: false,
                video: {
                    width: this.videowidth,
                    height: this.videoheight
            }})
            .then( function(stream){
                stream.getVideoTracks()[0]
                this.$refs.shareScreen.srcObject = stream;
            }.bind(this), function(error){
                alert('error')
            });
        }
    }
}
</script>

<style>
.videoStream {
    position: relative;
    margin: 0px auto;
    overflow: visible;
    border-radius: 8px;
}
.videoStream .local-stream video {
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
.btn{
    border: 0 none;
    padding: 6px 9px;
    border-radius: 50%;
    margin-right: 6px;
    margin-bottom: 0px; 
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
.room >div{
    display: flex;
    justify-content: start;
    margin-bottom: 5px;
    float: left;
}
.video-call{    
    height: 250px;
    width: 100%;
}
.video-call >video{    
    height: 250px;
    width: 100%;
    margin-left: 2px 
}
input{
    margin: 5px;
}
button{
    margin: 5px
}
.member{
    width: 250px;
    padding: 0px;
    height: 140px;
    margin: 2px;
}
</style>
