import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createORM } from 'pinia-orm'


import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
pinia.use(createORM())

app.use(pinia)
app.use(router)

app.mount('#app')
