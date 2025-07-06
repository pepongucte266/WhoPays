import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css' // Import PrimeIcons CSS

import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import SplitButton from 'primevue/splitbutton'

import Select from 'primevue/select' // Use Select instead of deprecated Dropdown
import Button from 'primevue/button'
import ButtonGroup from 'primevue/buttongroup'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable' // Import DataTable
import Column from 'primevue/column' // Import Column
import Dialog from 'primevue/dialog' // Import Dialog
import Checkbox from 'primevue/checkbox' // Import Checkbox
import Skeleton from 'primevue/skeleton' // Import Skeleton
import Tooltip from 'primevue/tooltip' // Import Tooltip

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.my-app-dark',
      cssLayer: false,
    },
  },
})
app.use(ConfirmationService)
app.use(ToastService)

// Register PrimeVue components globally with "Prime" prefix
app.component('PrimeSelect', Select)
app.component('PrimeButton', Button)
app.component('ButtonGroup', ButtonGroup)
app.component('PrimeInputText', InputText)
app.component('PrimeInputNumber', InputNumber)
app.component('PrimeDataTable', DataTable)
app.component('PrimeColumn', Column)
app.component('PrimeDialog', Dialog)
app.component('PrimeConfirmDialog', ConfirmDialog)
app.component('PrimeToast', Toast)
app.component('PrimeSplitButton', SplitButton)
app.component('PrimeCheckbox', Checkbox)
app.component('PrimeSkeleton', Skeleton) // Register Skeleton

app.directive('tooltip', Tooltip) // Register Tooltip directive

app.mount('#app')
