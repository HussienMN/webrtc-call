import { defineCustomElement} from 'vue'

import webrtcStream from './components/webrtcStream.ce.vue'
import webrtcCall from './components/webrtcCall.ce.vue'
import webrtcRoomCall from './components/webrtcRoomCall.ce.vue'
import webrtcPeerCall from './components/webrtcPeerCall.ce.vue'

const element1 = defineCustomElement(webrtcStream)
const element2 = defineCustomElement(webrtcCall)
const element3 = defineCustomElement(webrtcPeerCall)
const element4 = defineCustomElement(webrtcRoomCall)

customElements.define("webrtc-stream", element1)
customElements.define("webrtc-call", element2)
customElements.define("webrtc-peercall", element3)
customElements.define("webrtc-roomcall", element4)


