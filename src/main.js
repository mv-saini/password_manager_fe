import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import store from './store'
import cookies from 'vue-cookies'

loadFonts()

createApp(App)
  .use(router)
  .use(store)
  .use(vuetify)
  .use(cookies)
  .mount('#app')
