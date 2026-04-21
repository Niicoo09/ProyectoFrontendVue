import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import MasterForm from '../views/MasterForm.vue';
import EquipmentDashboard from '../views/EquipmentDashboard.vue';
import EquipmentManager from '../views/EquipmentManager.vue';

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
  {
    path: '/equipos',
    name: 'EquipmentDashboard',
    component: EquipmentDashboard,
  },
  {
    path: '/equipos/:type',
    name: 'EquipmentManager',
    component: EquipmentManager,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
