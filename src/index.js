import Vue from "vue";
import audioPlayer from "./audio-player.vue";

window.vueApp = new Vue({
	name: 'audio-player',
	el: '#app',
	components: {
		audioPlayer
	}
});