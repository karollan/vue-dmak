import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.js'),
			name: 'VueDmak',
			fileName: (format) => `vue-dmak.${format}.js`,
			formats: ['es', 'umd']
		},
		rollupOptions: {
			// Externalize deps that shouldn't be bundled
			external: ['vue', 'raphael'],
			output: {
				// Provide global variables for UMD build
				globals: {
					vue: 'Vue',
					raphael: 'Raphael'
				}
			}
		}
	}
});

