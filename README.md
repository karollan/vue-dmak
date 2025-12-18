# vue-dmak

Vue component wrapper for [Draw Me A Kanji (dmak)](https://github.com/mbilbille/dmak) - Render your Japanese writings with fun and taste.

## Installation

```bash
npm install vue-dmak
```

## Usage

### Basic Usage

```vue
<template>
	<VueDmak text="こんにちは" :uri="kanjiUri" />
</template>

<script>
import VueDmak from 'vue-dmak';

export default {
	components: {
		VueDmak
	},
	data() {
		return {
			kanjiUri: 'http://kanjivg.tagaini.net/kanjivg/kanji/'
		};
	}
};
</script>
```

### Global Registration

```javascript
import { createApp } from 'vue';
import VueDmak from 'vue-dmak';

const app = createApp(App);
app.use(VueDmak);
```

### With Options

```vue
<template>
	<VueDmak
		text="世界"
		:uri="kanjiUri"
		:autoplay="false"
		:height="150"
		:width="150"
		:stroke="strokeOptions"
		@loaded="onLoaded"
		@drew="onDrew"
		@erased="onErased"
		ref="dmakRef"
	/>
	<div>
		<button @click="play">Play</button>
		<button @click="pause">Pause</button>
		<button @click="reset">Reset</button>
		<button @click="next">Next</button>
		<button @click="back">Back</button>
	</div>
</template>

<script>
import VueDmak from 'vue-dmak';

export default {
	components: {
		VueDmak
	},
	data() {
		return {
			kanjiUri: 'http://kanjivg.tagaini.net/kanjivg/kanji/',
			strokeOptions: {
				attr: {
					stroke: '#FF0000',
					'stroke-width': 5
				}
			}
		};
	},
	methods: {
		play() {
			this.$refs.dmakRef.render();
		},
		pause() {
			this.$refs.dmakRef.pause();
		},
		reset() {
			this.$refs.dmakRef.erase();
		},
		next() {
			this.$refs.dmakRef.renderNextStrokes(1);
		},
		back() {
			this.$refs.dmakRef.eraseLastStrokes(1);
		},
		onLoaded(strokes) {
			console.log('Loaded', strokes);
		},
		onDrew(pointer) {
			console.log('Drew stroke', pointer);
		},
		onErased(pointer) {
			console.log('Erased stroke', pointer);
		}
	}
};
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | String | (required) | The Japanese text to render |
| `uri` | String | `''` | Path to the SVG files folder (KanjiVG) |
| `skipLoad` | Boolean | `false` | Skip SVG files loading |
| `autoplay` | Boolean | `true` | Start drawing as soon as all SVG files are loaded |
| `height` | Number | `109` | Height in pixels of a single paper surface |
| `width` | Number | `109` | Width in pixels of a single paper surface |
| `viewBox` | Object | `{x: 0, y: 0, w: 109, h: 109}` | ViewBox configuration |
| `step` | Number | `0.03` | Positive number which defines the speed of the drawing |
| `stroke` | Object | See below | Stroke configuration |
| `grid` | Object | See below | Grid configuration |

### Stroke Options

```javascript
{
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
		stroke: '#2C2C2C', // Can use "random" for random color
		'stroke-width': 4,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round'
	}
}
```

### Grid Options

```javascript
{
	show: true,
	attr: {
		stroke: '#CCCCCC',
		'stroke-width': 0.5,
		'stroke-dasharray': '--'
	}
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `loaded` | `strokes` | Emitted when all SVG files are fully loaded |
| `drew` | `pointer` | Emitted when a stroke is drawn |
| `erased` | `pointer` | Emitted when a stroke is erased |

## Methods

Access methods via template ref:

```vue
<VueDmak ref="dmakRef" text="こんにちは" :uri="kanjiUri" />
```

| Method | Parameters | Description |
|--------|------------|-------------|
| `render(end)` | `end` (optional) | Render strokes. If `end` is provided, render up to that stroke index |
| `pause()` | - | Pause rendering |
| `erase(end)` | `end` (optional) | Erase strokes. If `end` is provided, erase up to that stroke index |
| `eraseLastStrokes(nbStrokes)` | `nbStrokes` | Remove the last N strokes |
| `renderNextStrokes(nbStrokes)` | `nbStrokes` | Render the next N strokes |

## Compatibility

- Vue 3.0+
- Chrome 1.0+
- Firefox 16.0+
- Opera 17.0+
- Safari 3.0+
- IE 10.0+ (animation not supported)

## Credits

- Original dmak library by [Matthieu Bilbille](https://github.com/mbilbille/dmak)
- [KanjiVG](http://kanjivg.tagaini.net) for providing SVG files
- [Raphaël](http://dmitrybaranovskiy.github.io/raphael/) for SVG manipulation

## License

MIT

