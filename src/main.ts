import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import './styles/variables.less'
import '@/assets/css/variables.less'
import './styles/common.less'
import '@/assets/css/comcom.less'
import { Icon } from '@iconify/vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(VueCropper)
app.component('AppIcon', Icon)

app.mount('#app')
