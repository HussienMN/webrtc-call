<template>
  <div class="videoStream">
    <video
      class="remote-stream"
      ref="localVideo"
      id="localVideo"
      v-if="isStreaming"
    >
      thier video
    </video>
    <div class="buttons">
      <button v-on:click="startCall" v-if="!isStreaming" title="start stream">
        <img src="../assets/call.png" />
      </button>
      <button
        v-on:click="stopStreaming"
        v-if="isStreaming"
        title="start stream"
      >
        <img src="../assets/endcall.png" />
      </button>
      <button
        v-on:click="screenShot"
        v-if="isStreaming && doscreenshot"
        title="selfie"
      >
        <img src="../assets/selfie.png" />
      </button>
      <button
        id="muteBtn"
        v-on:click="doMute"
        v-if="isStreaming && !muteBtn"
        title="mute"
      >
        <img src="../assets/muteButton.png" />
      </button>
      <button
        id="muteBtn"
        v-on:click="unMute"
        v-if="isStreaming && muteBtn"
        title="ummute"
      >
        <img src="../assets/unmuteButton.png" />
      </button>
      <button
        id="hideCamBtn"
        v-on:click="hideCam"
        v-if="isStreaming && !hideCamBtn"
        title="hide camera"
      >
        <img src="../assets/hideCam.png" />
      </button>
      <button
        id="hideCamBtn"
        v-on:click="showCam"
        v-if="isStreaming && hideCamBtn"
        title="show camera"
      >
        <img src="../assets/unhideCam.png" />
      </button>
      <button
        v-on:click="startRecording"
        v-if="this.isStreaming && dorecording"
        title="start recording"
      >
        <img src="../assets/recording.png" />
      </button>
      <button
        v-on:click="stopRecording"
        v-if="this.isStreaming && this.mediaRecorder"
        title="stop recording"
      >
        <img src="../assets/stoprecording.png" />
      </button>
      <button
        v-on:click="playStream"
        v-if="this.isStreaming && this.mediaRecorder"
        title="play record"
      >
        <img src="../assets/playrecord.png" />
      </button>
      <button
        v-on:click="playStreamDelete"
        v-if="this.isStreaming && this.mediaRecorder"
        title="delete record"
      >
        <img src="../assets/recordDelete.png" />
      </button>
      <button
        v-on:click="ShareScreen"
        v-if="this.isStreaming && dosharescreen"
        title="sharescreen"
      >
        <img src="../assets/sharescreen.png" />
      </button>
    </div>
    <div class>
      <div class="container" id="container" v-if="isStreaming">
        <canvas ref="canvas"> </canvas>
        <button
          class="btn"
          v-on:click="screenShotDelete"
          v-if="isStreaming && this.SHButton"
        >
          <img src="../assets/delete.png" />
        </button>
      </div>
    </div>
    <video
      class="media_v"
      ref="webcamVideo"
      autoplay
      playsinline
      style="border-radius: 8px"
      v-if="isStreaming"
    ></video>
    <video
      class="media_v"
      ref="shareScreen"
      autoplay
      playsinline
      v-if="isStreaming"
    ></video>
    <button
      v-on:click="stopShareScreen"
      v-if="this.isStreaming && this.isShare"
    >
      <img src="../assets/delete.png" />
    </button>
  </div>
</template>

<script >
export default {
  name: "webrtcstream",
  inheritAttrs: false,
  data: function () {
    return {
      localStream: null,
      isStreaming: false,
      isJoined: false,
      SHButton: false,
      recordedVideo: [],
      isrecordedVideo: false,
      recording: false,
      mediaRecorder: null,
      webcamVideo: null,
      SHButton: false,
      isShare: false,
      stream: null,
      muteBtn: false,
      hideCamBtn: false,
    };
  },
  props: {
    videowidth: {
      type: [String, Number],
      default: 450,
    },
    videoheight: {
      type: [String, Number],
      default: 250,
    },
    isaudio: {
      type: Boolean,
      default: true,
    },
    audiobitspersecond: {
      type: [String, Number],
      default: 128000,
    },
    videobitspersecond: {
      type: [String, Number],
      default: 2500000,
    },
    mimetype: {
      type: String,
      default: "video/webm;codecs=vp8,opus",
    },
    isStartStream: {
      type: Boolean,
      default: true,
    },
    isStoptStream: {
      type: Boolean,
      default: true,
    },
    doscreenshot: {
      type: Boolean,
      default: false,
    },
    dorecording: {
      type: Boolean,
      default: false,
    },
    dosharescreen: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    startCall: function () {
      this.isStreaming = true;
      this.localStream = navigator.mediaDevices
        .getUserMedia({
          video: {
            height: this.videoheight,
            width: this.videowidth,
          },
          audio: true,
        })
        .then(
          function (stream) {
            this.$refs.localVideo.srcObject = stream;
            this.$refs.localVideo.play();
            this.localStream = stream;
          }.bind(this)
        )
        .catch(function (error) {
          console.log(error);
          return;
        });
    },
    stopStreaming: function () {
      this.isStreaming = false;
      if (this.$refs.localVideo.srcObject) {
        this.$refs.localVideo.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        this.$refs.localVideo.srcObject = null;

        this.noSrc = false;
      } else {
        alert("there is no streaming");
      }
    },
    screenShot: function () {
      if (this.localStream) {
        this.SHButton = true;
        this.$refs.canvas.width = this.videowidth;
        this.$refs.canvas.height = this.videoheight;
        this.$refs.canvas
          .getContext("2d")
          .drawImage(
            this.$refs.localVideo,
            0,
            0,
            this.videowidth,
            this.videoheight
          );
      } else {
        alert("error");
      }
    },
    screenShotDelete: function () {
      this.$refs.canvas
        .getContext("2d")
        .clearRect(0, 0, this.videowidth, this.videoheight);
      this.SHButton = false;
    },
    startRecording: function () {
      this.recordedVideo = [];
      let videoRec = [];
      videoRec = this.recordedVideo;
      var options = {
        audioBitsPerSecond: this.audiobitspersecond,
        videoBitsPerSecond: this.videobitspersecond,
        mimeType: this.mimetype,
      };

      let videoStream = this.$refs.localVideo.srcObject;
      if (this.localStream) {
        this.mediaRecorder = new MediaRecorder(videoStream, options);
        console.log("the mediarecorder" + this.mediaRecorder);
        this.recording = true;
        this.isrecordedVideo = true;
        this.mediaRecorder.ondataavailable = function (event) {
          if (event.data && event.data.size > 0) {
            videoRec.push(event.data);
            return;
          }
        };
        this.mediaRecorder.start();
      } else {
        alert("there is no streaming pls start streaming first");
      }
    },
    playStream: function () {
      if (this.mediaRecorder != null) {
        const superBuffer = new Blob(this.recordedVideo);
        this.$refs.webcamVideo.src = URL.createObjectURL(superBuffer);
        this.$refs.webcamVideo.controls = true;
        this.SRButton = true;
        this.$refs.webcamVideo.play();
      } else {
        alert("there is no recorded video to be displayed");
      }
    },
    playStreamDelete: function () {
      if (this.$refs.webcamVideo.src != null) {
        this.$refs.webcamVideo.src = null;
        this.$refs.webcamVideo = null;
        this.SRButton = false;
      } else {
        console.log("error");
      }
    },
    stopRecording: function () {
      if (this.mediaRecorder != null) {
        this.mediaRecorder.stop();
        this.recording = false;
      } else {
        alert("it is not recording");
      }
    },
    ShareScreen: function () {
      this.joined = true;
      this.isShare = true;
      this.stream = navigator.mediaDevices
        .getDisplayMedia({
          audio: true,
          video: {
            width: this.videowidth,
            height: this.videoheight,
          },
        })
        .then(
          function (stream) {
            this.$refs.shareScreen.srcObject = stream;
            this.stream.getVideoTracks()[0];
            this.$refs.shareScreen.srcObject = stream;
          }.bind(this)
        )
        .catch(function (error) {
          alert(error);
        });
    },
    stopShareScreen: function () {
      this.isShare = false;
      if (this.$refs.shareScreen.srcObject) {
        this.$refs.shareScreen.srcObject = null;
        this.stream = null;
      }
    },
    doMute: function () {
      this.muteBtn = true;
      this.$refs.localVideo.srcObject.getTracks()[0].enabled = false;
    },
    unMute: function () {
      this.muteBtn = false;
      this.$refs.localVideo.srcObject.getTracks()[0].enabled = true;
    },
    hideCam: function () {
      this.hideCamBtn = true;
      this.$refs.localVideo.srcObject.getTracks()[1].enabled = false;
    },
    showCam: function () {
      this.hideCamBtn = false;
      this.$refs.localVideo.srcObject.getTracks()[1].enabled = true;
    },
  },
  mounted() {},
};
</script>
<style scoped>
.videoStream video {
  width: 100%;
  height: 100%;
  position: relative;
  border: none;
  margin: 0px auto;
  overflow: visible;
  border-radius: 8px;
}
.videoStream .buttons {
  position: initial;
  bottom: 0;
  right: 0;
  margin-right: 20px;
  margin-bottom: 10px;
}
.videoStream .buttons button {
  border: 0 none;
  padding: 11px 12px;
  margin-right: 6px;
}
.container {
  position: relative;
  width: 50%;
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