<template>
	<div :id="elementId" ref="dmakContainer"></div>
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
				elementId: `dmak-${Math.random().toString(36).slice(2, 11)}`
			};
		},
	mounted() {
		this.initDmak();
	},
	watch: {
		text: {
			handler(newText) {
				if (this.dmak) {
					this.dmak.pause();
					this.dmak.erase();
				}
				this.initDmak();
			},
			immediate: false
		}
	},
	beforeUnmount() {
		if (this.dmak) {
			this.dmak.pause();
		}
	},
	methods: {
		initDmak() {
			// Wait for next tick to ensure DOM is ready
			this.$nextTick(() => {
				const options = {
					element: this.elementId,
					uri: this.uri,
					skipLoad: this.skipLoad,
					autoplay: this.autoplay,
					height: this.height,
					width: this.width,
					viewBox: this.viewBox,
					step: this.step,
					renderAt: this.renderAt,
					stroke: this.stroke,
					grid: this.grid,
					loaded: (strokes) => {
						this.$emit('loaded', strokes);
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

