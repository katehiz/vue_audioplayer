import Vue from "vue";
import VueAudioPlayer from "./audio-player.vue";
import "./scss/audio-player.scss";

Vue.config.productionTip = false;

window.vueApp = new Vue({
	el: '#application',
	components: {
		VueAudioPlayer
	}
});