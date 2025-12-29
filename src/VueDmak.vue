<template>
	<div v-if="view === 'canvas'" :id="elementId" ref="dmakContainer"></div>
	<div v-if="view === 'series'" class="dmak-series-container" :style="seriesStyle">
		<div 
			v-for="(s, index) in strokes" 
			:key="index" 
			ref="seriesFrames" 
			class="dmak-series-frame"
			:style="[{ position: 'relative', width: (width * nbChars) + 'px', height: height + 'px' }]"
		></div>
	</div>
</template>

<script>
import { Dmak } from './dmak.js';
import Raphael from 'raphael';

export default {
	name: 'VueDmak',
	props: {
		text: {
			type: String,
			required: true,
			default: ''
		},
		view: {
			type: String,
			default: 'canvas', // 'canvas' | 'series'
			validator: (value) => ['canvas', 'series'].includes(value)
		},
		seriesStyle: {
			type: Object,
			default: () => ({})
		},
		seriesActiveStyle: {
			type: Object,
			default: () => ({
				activeStroke: {
					attr: {
						stroke: '#BF0000'
					}
				},
				arrow: {
					show: true,
					attr: {
						stroke: '#BF0000',
						size: 10
					}
				}
			})
		},
		uri: {
			type: String,
			default: ''
		},
		skipLoad: {
			type: Boolean,
			default: false
		},
		autoplay: {
			type: Boolean,
			default: true
		},
		height: {
			type: Number,
			default: 109
		},
		width: {
			type: Number,
			default: 109
		},
		viewBox: {
			type: Object,
			default: () => ({
				x: 0,
				y: 0,
				w: 109,
				h: 109
			})
		},
		renderAt: {
			type: Number,
			default: null
		},
		step: {
			type: Number,
			default: 0.03
		},
		stroke: {
			type: Object,
			default: () => ({
				animated: {
					drawing: true,
					erasing: true
				},
				order: {
					visible: false,
					attr: {
						'font-size': '8',
						fill: '#999999'
					}
				},
				attr: {
					active: '#BF0000',
					stroke: '#2C2C2C',
					'stroke-width': 4,
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round'
				}
			})
		},
		grid: {
			type: Object,
			default: () => ({
				show: true,
				attr: {
					stroke: '#CCCCCC',
					'stroke-width': 0.5,
					'stroke-dasharray': '--'
				}
			})
		}
	},
	emits: ['loaded', 'erased', 'drew'],
		data() {
			return {
				dmak: null,
				elementId: `dmak-${Math.random().toString(36).slice(2, 11)}`,
				strokes: [],
				nbChars: 1
			};
		},
	mounted() {
		this.initDmak();
	},
	watch: {
		text: {
			handler() {
				this.initDmak();
			},
			immediate: false
		},
		step: {
			handler() {
				this.initDmak();
			}
		},
		view: {
			handler() {
				this.initDmak();
			}
		},
		seriesActiveStyle: {
			handler() {
				this.initDmak();
			},
			deep: true
		},
		stroke: {
			handler() {
				this.initDmak();
			},
			deep: true
		},
		grid: {
			handler() {
				this.initDmak();
			},
			deep: true
		}
	},
	beforeUnmount() {
		if (this.dmak) {
			this.dmak.pause();
		}
	},
	methods: {
		reset() {
			if (this.dmak && this.view === 'canvas') {
				this.dmak.restart();
			}
		},
		initDmak() {
			// Wait for next tick to ensure DOM is ready
			this.$nextTick(() => {
				if (this.dmak) {
					this.dmak.destroy();
				}

				// Clear series strokes if reloading
				this.strokes = [];

				const options = {
					element: this.elementId,
					uri: this.uri,
					skipLoad: this.skipLoad,
					skipPapers: this.view === 'series',
					autoplay: this.view === 'canvas' ? this.autoplay : false,
					height: this.height,
					width: this.width,
					viewBox: this.viewBox,
					step: this.step,
					renderAt: this.renderAt,
					stroke: this.stroke,
					seriesActiveStyle: this.seriesActiveStyle,
					grid: this.grid,
					loaded: (strokes) => {
						this.strokes = strokes;
						if (strokes.length > 0) {
							// Determine number of chars based on max char index
							const maxChar = strokes.reduce((max, s) => Math.max(max, s.char), 0);
							this.nbChars = maxChar + 1;
						} else {
							this.nbChars = 1;
						}
						
						this.$emit('loaded', strokes);
						
						if (this.view === 'series') {
							this.$nextTick(() => {
								if (this.$refs.seriesFrames) {
									this.$refs.seriesFrames.forEach((el, index) => {
										// Clear any previous content in the frame
										el.innerHTML = '';
										this.dmak.renderFrame(index, el);
									});
								}
							});
						}
					},
					erased: (pointer) => {
						this.$emit('erased', pointer);
					},
					drew: (pointer) => {
						this.$emit('drew', pointer);
					}
				};

				this.dmak = new Dmak(this.text, options, Raphael);
			});
		},
		// Public methods exposed via template ref
		render(end) {
			if (this.dmak) {
				return this.dmak.render(end);
			}
		},
		pause() {
			if (this.dmak) {
				this.dmak.pause();
			}
		},
		erase(end) {
			if (this.dmak) {
				return this.dmak.erase(end);
			}
		},
		eraseLastStrokes(nbStrokes) {
			if (this.dmak) {
				this.dmak.eraseLastStrokes(nbStrokes);
			}
		},
		renderNextStrokes(nbStrokes) {
			if (this.dmak) {
				this.dmak.renderNextStrokes(nbStrokes);
			}
		}
	}
};
</script>

<style scoped>
.dmak-svg {
	display: inline-block;
}
</style>

