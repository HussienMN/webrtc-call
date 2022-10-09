<template>
	<div>
        <webrtc-stream></webrtc-stream>
	</div>
</template>
 
<script>
	import Vue from 'vue';
	import webrtcstream from '@bit/hussienmn.webrtc-streaming.webrtc';

	Vue.component(webrtcstream.name, webrtcstream)

	export default {}
</script>
<style scoped>

.button {
	margin: 5px;
}
</style>