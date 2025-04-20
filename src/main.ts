import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// PrimeVue setup
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css' // Import PrimeIcons CSS

import Select from 'primevue/select' // Use Select instead of deprecated Dropdown
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable' // Import DataTable
import Column from 'primevue/column' // Import Column
import Dialog from 'primevue/dialog' // Import Dialog

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

// Register PrimeVue components globally with "Prime" prefix
app.component('PrimeSelect', Select)
app.component('PrimeButton', Button)
app.component('PrimeInputText', InputText)
app.component('PrimeInputNumber', InputNumber)
app.component('PrimeDataTable', DataTable)
app.component('PrimeColumn', Column)
app.component('PrimeDialog', Dialog)

app.mount('#app')
