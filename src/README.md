[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/owner/my-element)

# webrtcStream
    <webrtc-stream></webrtc-stream>
# Example
  [Live Example](https://hussienmn.github.io/webrtc-stream/)

# Description
custom element to make a video streaming using webRTC in the browser with the functionality in the section methods

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
    <script type="module" crossorigin src="./dist/assets/index.4df1bdcf.js"></script>
  </head>
  <body>
    <webrtc-stream></webrtc-stream>
  </body>
</html>

```

### Props

| name                | type                 |
| --------------      | ---------------------|
| videoWidth          | [String, Number]     |
| videoHeight         | [String, Number]     |
| videoBitsPerSecond  | String               |      
| isStartStream       | Boolean              |
| isStoptStream       | Boolean              |
| isScreenShot        | Boolean              |
| isRecording         | Boolean              |
| isShareScreen       | Boolean              |
| audioBitsPerSecond  | String               |

### Methods

| name           | description                                                             |
| -------------- | ------------------------------------------------------------------------|
| startStreaming | start video streaming                                                   |
| stopStreaming  | stop video Streaming                                                    |
| startRecording | start recording the video stream                                        |
| stopRecording  | stop recording the video stream                                         |
| screenShot     | take a screenshot of the video stream                                   |
| ShareScreen    | start sharing the content of the screen                                 |

## DEMO
```
<custom-element-demo>
  <template>
    <link rel="import" href="index.html">
    <link rel="import" href="./dist/assets/index.html">
    <webrtc-stream></webrtc-stream>
  </template>
</custom-element-demo>
```
### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## License

MIT
## Credits

Author: [@HussienMN on GitHub ](https://github.com/HussienMN).
