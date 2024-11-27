import { createRouter, createWebHistory } from 'vue-router';
import WelcomeComponent from '../components/WelcomeComponent.vue';
import ProjectsComponent from '../components/ProjectsComponent.vue';
import ClientsActivitiesComponent from '../components/ClientsActivitiesComponent.vue';

const routes = [
  { path: '/', component: WelcomeComponent },
  { path: '/projects', component: ProjectsComponent },
  { path: '/projects/:id/clients-activities', component: ClientsActivitiesComponent }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;