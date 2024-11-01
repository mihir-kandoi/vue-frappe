import './assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import { plugin, defaultConfig } from '@formkit/vue'
import config from '../formkit.config.js'
import 'material-icons/iconfont/material-icons.css';
import './index.css'
import axios from 'axios';
import ConfirmationService from 'primevue/confirmationservice';

const api = axios.create({baseURL: import.meta.env.VITE_API_BASE_URL});

const app = createApp(App)
app.use(router)

app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ConfirmationService);
app.use(VueSidebarMenu)
app.use(plugin, defaultConfig(config))
app.mount('#app')

export default api;