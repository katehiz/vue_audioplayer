<template>
    <div class="post-audio-player">
        <p class="text-small" v-show="!html5Supported">
            Ваш браузер не поддерживает HTML5 MP3 аудио формат.
            Воспользуйтесь <a :href="url">ссылкой для загрузки аудиозаписи статьи</a>.
        </p>

        <div id="audio_controls" class="controls" data-state="visible" v-show="showPlayer" v-cloak>
            <button type="button" class="playpause"
                    :data-state="[played ? 'pause' : 'play']"
                    @click="playPause()">
                Play/Pause
            </button>
            <!-- stop button - if you need -->
            <!--<button id="stop" type="button" data-state="stop" @click="stop()">Stop</button>-->
            <div class="timer">
                <span id="timer_current" class="timer__current">{{ currentTime | timerFormat}}</span>
                <span>&nbsp;/&nbsp;</span>
                <span id="timer_total" class="timer__total">{{ totalTime | timerFormat }}</span>
            </div>

            <div class="progress_range">
                <input class="progress" type="range" min="0" max="100" step="1"
                       ref="progress_range"
                       :value="progress"
                       v-on:input="changeTrackTime($event.target.value)">
                <div class="fill-lower" :style="{width: progress + '%'}"></div>
            </div>

            <div class="volume" ref="volume">
                <button class="volume-mute" type="button"
                        ref="volume_mute"
                        :data-state="[muted ? 'mute' : 'unmute']"
                        @click="mute()">
                    Mute/Unmute
                </button>
                <div class="volume_range">
                    <div class="volume_wrap">
                        <input type="range" min="0" max="1" step="0.1" v-model="volume">
                        <div class="fill-lower" :style="{width: `${volume*100}%`}"></div>
                    </div>
                </div>
            </div>

            <button type="button" class="download" @click="downloadAudio">download</button>

            <div class="speed-rate" v-click-outside="hideSpeedList">
                <button type="button" class="speed-rate__btn" @click="visibilitySpeedList">download</button>
                <transition name="slide-fade">
                    <ul class="speed-rate__list" v-show="showSpeedList">
                        <li v-for="item in speedRateList" :key="item.val"
                            :class="[item.active ? 'active' : '']"
                            :data-speed-val="item.val"
                            @click="selectSpeedRate($event.target)"
                        >
                            {{item.text}}
                        </li>
                    </ul>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
	export default {
		name : 'post-audio-player',
		directives: {
			// Директива для обработки щклчка вне элемента. Принимает только функцию в качестве значения
			clickOutside: {
				bind(el, binding) {
					el.addEventListener('click', e => e.stopPropagation());
					document.body.addEventListener('click', binding.value);

					el.addEventListener('touchstart', e => e.stopPropagation());
					document.body.addEventListener('touchstart', binding.value);
				},
				unbind(el, binding) {
					document.body.removeEventListener('click', binding.value);
					document.body.removeEventListener('touchstart', binding.value);
				}
			}
		},
		props: {
			url: {
				required: true,
				default: ''
			}
		},
		data () {
			return {
				showPlayer: false,
				track: null,
				played: false,
				paused: true,
				muted: false,
				progress: 0,
				volume: 0.5,
				showVolume: false,
				speedRate: 1.0,
				currentTime: 0,
				totalTime: 0,
				timer: null,
				html5Supported: true,
				isIE: false,
				showSpeedList: false,
				speedRateList: [
					{val: 0.75, text: '0.75', active: false},
					{val: 1.0, text: 'Обычная', active: true},
					{val: 1.25, text: '1.25', active: false},
					{val: 1.5, text: '1.5', active: false},
					{val: 2.0, text: '2.0', active: false}
				]
			}
		},
		computed: {},
		watch: {
			muted(val) {
				this.track.muted = val;
			},
			// отслеживает изменение реактивного значения volume в ползунке и меняет громкость функцией setVolumeLevel()
			volume(val) {
				this.setVolumeLevel(val);
			}
		},
		methods: {
			visibilitySpeedList() {
				this.showSpeedList = !this.showSpeedList;
			},
			hideSpeedList() {
				this.showSpeedList = false
			},
			// стоп/пауза
			playPause() {
				if (this.played) {
					this.track.pause();
					this.played = false;
					this.stopTimer();
				} else {
					this.track.play();
					this.played = true;
					this.startTimer();
				}
			},
			// остановка возпроизведения с обнулением таймера - if you need
			/*stop() {
				if (!this.stopped) {
					this.played = false;
					this.paused = true;
					this.stopTimer();
					this.track.pause();
					this.track.currentTime = 0;
				}
			},*/
			// переключатель режима mute/unmute
			mute() {
				//this.track.muted = !this.muted;
				this.muted = !this.muted;
			},
			// загрузить дорожку как файл
			downloadAudio() {
				let element = document.createElement('a');
				let filename = this.$props.url.split('/');
				filename = filename[filename.length - 1];
				element.setAttribute('href', this.$props.url);
				element.setAttribute('download', filename);
				element.click();
			},
			// установить громкость трека
			setVolumeLevel(val) {
				this.track.volume = val;
				this.muted = false;
				//this.track.muted = false;
			},
			// запуск таймера, обновление времени возпроизведения, позиции ползунка
			startTimer() {
				this.timer = setInterval(() => {
					let progressPercentVal = Math.ceil(this.track.currentTime / this.totalTime * 100);
					this.currentTime = this.track.currentTime;
					this.progress = progressPercentVal;
				}, 500);
			},
			// остановить и очистить таймер
			stopTimer() {
				clearInterval(this.timer);
				this.timer = null;
			},
			// изменить текущее время переменной и объекта audio
			changeTrackTime(val) {
				let selectTime = Math.ceil(this.totalTime / 100 * val);
				this.currentTime = selectTime;
				this.track.currentTime = selectTime;
				this.progress = Math.ceil(this.track.currentTime / this.totalTime * 100);
			},
			// выбор скорости воспроизведения аудио
			selectSpeedRate(element) {
				let speed = element.dataset.speedVal;
				console.assert(!!speed, 'не указана скорость, невозможно изменить скорость воспроизведения');
				this.speedRate = speed;
				this.speedRateList = this.speedRateList.map(item => {
					item.active = false;
					item.active = item.val == speed;
					return item;
				});
				this.track.playbackRate = speed; // изменить скорость дорожки
				this.showSpeedList = false; // скрыть список выбора скорости
			}
		},
		filters: {
			timerFormat(val) {
				if (!val) return '00:00';
				return (new Date(val * 1000)).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0].slice(-5);
			}
		},
		created() {
			console.log(this.$props.url);
			// проверка на поддержку audio API браузером
			let testAudioTag = document.createElement('audio');
			if (testAudioTag.canPlayType === undefined || testAudioTag.canPlayType('audio/mpeg') === '') {
				this.html5Supported = false;
				return; // останавливаем выполнение этапа created
			}
			// удаление элемента и очистка ссылки на него
			testAudioTag.remove();
			testAudioTag = null;

			if (this.$props.url === '') return;
			fetch(this.$props.url, {
				method: 'HEAD',
				mode: 'cors'
			}).then((response) => {
				console.assert(response.ok, 'post-audio-player: не найден аудио-файл по указнному пути');
			});
			// создаём экземпляр аудио
			this.track = new Audio(this.$props.url);

			// предзагрузка метаданных трека
			this.track.preload = 'metadata';

			// canplaythrough - когда трек получил метаданные и загрузился достаточно, чтобы возпроизвести без задержек
			// похожее событие loadeddata - окончание загрузки первого фрейма
			this.track.addEventListener('canplaythrough', () => {
				// получаем из метаданных общее время трека
				this.totalTime = Math.round(this.track.duration);
			});

			// показываем отрендеренный плеер
			this.showPlayer = true;
		},
		mounted() {
			/* показ/скрытие ползунка громкости при наведении с задежкой после ухода мыши */
			// for custom animation with native JS
			(() => {
				let timer = null;
				this.$refs.volume.addEventListener('mouseenter', (event) => {
					if (timer !== 0) clearInterval(timer);
					event.target.classList.add('show');
				});
				this.$refs.volume.addEventListener('mouseleave', (event) => {
					let target = event.target;
					timer = setTimeout(() => {
						target.classList.remove('show');
					}, 1000);
				})
			})();
		}
	}
</script>

<style scoped type="scss">
    @import "scss/audio-player.scss";
</style>
