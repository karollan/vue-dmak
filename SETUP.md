# Setup Instructions

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the library:
```bash
npm run build
```

This will create the `dist` folder with:
- `vue-dmak.es.js` - ES module version
- `vue-dmak.umd.js` - UMD version for browsers

## Testing Locally

You can test the component using the example.html file after building:

1. Build the library: `npm run build`
2. Open `example.html` in a browser (you may need to serve it via a local server due to CORS)

Or use a local server:
```bash
npx serve .
```

## Publishing to npm

1. Update version in `package.json`
2. Build: `npm run build`
3. Publish: `npm publish`

The `prepublishOnly` script will automatically build before publishing.

## Usage in Your Vue Project

After installing via npm:

```bash
npm install vue-dmak
```

Use in your Vue component:

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

## Notes

- Make sure `raphael` is installed as a peer dependency in your project
- The component requires Vue 3.0+
- All dmak features are available through props and component methods

