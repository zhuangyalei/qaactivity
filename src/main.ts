import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入vant所有组件样式
import 'vant/lib/index.css'

import JSLogin from '@lyh/jslogin'
import JSBridge from '@lyh/jsbridge'


// import erudaVue from 'eruda-vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(JSBridge)
app.use(JSLogin)

app.mount('#app')

// eruda.add(erudaVue)
