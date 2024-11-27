import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from './plugins/axios';

const app = createApp(App);

app.config.globalProperties.$axios = axios; // Adiciona o Axios como uma propriedade global

app.use(router).mount('#app');