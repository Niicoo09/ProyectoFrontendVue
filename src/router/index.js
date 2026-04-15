import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import MasterForm from '../views/MasterForm.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/master-form/:id?', // <- El ? indica que el parámetro es opcional
    name: 'MasterForm',
    component: MasterForm,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
