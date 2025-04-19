import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// PrimeVue setup
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

import PrimeSelect from 'primevue/select'
import PrimeButton from 'primevue/button'
import PrimeInputText from 'primevue/inputtext'
import PrimeInputNumber from 'primevue/inputnumber'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})

app.component('PrimeSelect', PrimeSelect)
app.component('PrimeButton', PrimeButton)
app.component('PrimeInputText', PrimeInputText)
app.component('PrimeInputNumber', PrimeInputNumber)

app.mount('#app')
