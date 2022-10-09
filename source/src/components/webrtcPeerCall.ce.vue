<template>
    <div>
        <div class="videoStream">
                <p ref="peerID">Your Peer ID: {{this.peerID}}</p>
            <video class="remote-stream" ref="localVideo" id="localVideo" v-if="isStreaming"></video>
            <video class="local-stream"  id="remoteVideo" ref="remoteVideo" v-if="isStreaming"></video>
            
            <div class="controls">
                <button v-on:click="startCall" v-if="!isStreaming" title="start stream">
                    <img src="../assets/call.png"/>
                </button>
                <button id="btn2" ref="" v-on:click="leaveCall" v-if="isStreaming" title="leave call">
                    <img src="../assets/endcall.png"/> 
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
                <button id="btn3" v-on:click="screenShot" v-if="isStreaming" title="selfie">
                    <img src="../assets/selfie.png"/>           
                </button>
                <button v-on:click="joinCall" v-if="isStreaming">
                    <img src="../assets/conferencecall.png"/> 
                </button>  
                <div>
                    <input ref="peerid" type="text" v-model="remoteID" v-if="isStreaming">
                </div>           
            </div>
            <div class="container" id="container">
                <canvas ref="canvas"> </canvas>
                <button class="btn" v-on:click="screenShotDelete" v-if="SHButton">
                    X
                </button>  
            </div>     
        </div>
    </div>
    </template>
    
    <script>
    import Peer from 'skyway-js'
    export default {
        name: 'webrtcPeerCall',
        inheritAttrs: false,
        data: function(){
            return{
                localStream: null,
                peerID: null,
                isStreaming: false,
                isJoined: false,
                SHButton : false,
                muteBtn: false,
                hideCamBtn: false,
                remoteID: '',
                mediaConnection:null,
                isaudio: this.isAudio
            }
        },
        props:{
            peerapikey:{
                type: String,
                default:'7e4dcc1e-8f4a-4546-ba1e-70e6248809df',
                required: true
            },
            videowidth: {
                type: [String, Number],
                default: 420,
            },
            videoheight: {
                type: [String, Number],
                default: 250
            },        
            peer_id: {
                type: String
            },
            remote_id: {
                type: String
            }
        },
        methods:{
            startCall: function(){
                this.isStreaming = true
                this.localStream = navigator.mediaDevices.getUserMedia({
                    video: {
                            height: this.videoheight,
                            width: this.videowidth,
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
                console.log(this.localStream)
            },
    
            joinCall: function(){
                this.isJoined = true
                if(this.remoteID == null || this.remoteID == '' || this.remoteID == ' '){
                    alert('enter peer id ')
                }else{
                    
                    let remoteVideo = document.getElementById('remoteVideo')
                    this.mediaConnection = this.Peer.call(this.remoteID, this.localStream);
                    this.mediaConnection.on('stream',  (stream)=>{
                        this.$refs.remoteVideo.srcObject = stream
                        this.$refs.remoteVideo.playsInline = true;
                        this.$refs.remoteVideo.play()
                    }) 
                    this.mediaConnection.once("close", () => {
                        this.mediaConnection.close(true)
                        this.$refs.remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
                        this.$refs.remoteVideo.srcObject = null;
                        this.$refs.localVideo.srcObject = null;
                    })
                }           
            },
            leaveCall: function(){
                this.isStreaming = false
                this.$refs.localVideo.srcObject.getTracks().forEach((track) => track.stop());
                this.$refs.localVideo.srcObject = null
                this.mediaConnection.close(true)  
                this.remoteID = ''
            },
            screenShot: function(){
                if(this.localStream){
                    this.SHButton = true                
                    this.$refs.canvas.width =  this.videowidth
                    this.$refs.canvas.height =  this.videoheight
                    this.$refs.canvas.getContext('2d').drawImage( this.$refs.localVideo, 0, 0 , this.videowidth, this.videoheight)
                }else{alert('error')}  
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
            fetchAPIKey: function(){
                console.log("API Key is : ", this.peerAPIkey)
            }          
        }, 
        mounted: function(){

            this.Peer = new Peer({
                key: this.peerapikey,
                debug: 3
            })

            this.Peer.once('open', function(){
                this.peerID = this.Peer.id
            }.bind(this))
    
            this.Peer.on('call', function(mediaConnection) {
                mediaConnection.answer(this.localStream);
                mediaConnection.on('stream', stream=>{
                    this.$refs.remoteVideo.srcObject = stream
                    this.$refs.remoteVideo.playsInline = true;
                    this.$refs.remoteVideo.play().catch(console.log(error))
                })
                mediaConnection.once("close", function() {
                    this.$refs.remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
                    this.$refs.remoteVideo.srcObject = null;               
                }.bind(this))   
                // mediaConnection.close(true)   
            }.bind(this))               
        }    
    }
    </script>
    <style>
.videoStream {
    position: relative;
    margin: 0px auto;
    background-color: rgba(255 255 255 / 30%);
    overflow: visible;
    border-radius: 8px;
}
.videoStream .local-stream {
    width: 65%;
    height: 25%;
    border-radius: 8px;
}
.videoStream .remote-stream {
    width: 100%;
    height: 50%;
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