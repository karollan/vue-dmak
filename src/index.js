import VueDmak from './VueDmak.vue';
import { Dmak } from './dmak.js';
import { DmakLoader } from './dmakLoader.js';

// Install function for Vue.use()
function install(Vue) {
	Vue.component('VueDmak', VueDmak);
}

export { VueDmak, Dmak, DmakLoader, install };

// Export component and install function
export default {
	VueDmak,
	Dmak,
	DmakLoader,
	install
};

// Auto-install when used in browser
// Auto-install logic removed for Vue 3 compatibility
// Users must explicitly install the plugin: app.use(VueDmak)

