[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/owner/my-element)

# webrtcStream
Functional custom element
<webrtc-peercall></webrtc-peercall>

# Example
[Live Example](https://hussienmn.github.io/webrtc-peercall/).

# Description
custom element to make a call with another peer using peer ID with the functionality in the section methods
The Peer ID is generated through the Skyway SDK by using Skyway signaling server
See [Deatils](https://webrtc.ecl.ntt.com/en/skyway/function.html).

It's important to have peerAPIkey from Skyway to get the functionality of the signaling server
To get the peerAPIkey from Skyway see deatils here (https://webrtc.ecl.ntt.com/en/skyway/function.html)
After that you can pass the peerAPIkey to the element as a property
Note !! you have to set up the domain of your website by creating peerAPIkey
## Project setup
```
npm install
```
## Usage

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + Vue</title>
    <script type="module" crossorigin src="./assets/index.4df1bdcf.js"></script>
  </head>
  <body>
    <webrtc-peercall></webrtc-peercall>
  </body>
</html>

```
### Props

| name           | type                 |
| -------------- | ---------------------|
| peerAPIkey     | String               |
| videoWidth     | [String, Number]     |
| videoHeight    | [String, Number]     |
| peer_ID        | String               |      
| remote_ID      | String               |

### Methods

| name              | description                                                             |
| ----------------- | ------------------------------------------------------------------------|
| startStreaming    | start video streaming                                                   |
| joinCall          | To make a video call with your call partner                             |
| leaveCall         | To End the call                                                         |
| screenShot        | To take a selfie                                                        |
| screenShotDelete  | to delete the selfie                                                    |
| doMute            | A toggel button to mute the sound                                       |
| unMute            | A toggel button to mute the sound                                       |
| hideCam           | A toggel button to hide the video cam                                   |
| showCam           | A toggel button to show the video cam                                   |

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## License

MIT
## Credits

Author: [@HussienMN on GitHub ](https://github.com/HussienMN).
