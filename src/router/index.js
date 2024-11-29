import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Criptosya from '../views/Criptosya.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/criptosya',
    name: 'criptosya',
    component: Criptosya,
  },
  {
    path: '/mercado',
    name: 'mercado',
    component: () => import('../views/Mercado.vue'),
  },
  {
    path: '/historial',
    name: 'historial',
    component: () => import('../views/Historial.vue'),
  },
  {
    path: '/estado-actual',
    name: 'estado-actual',
    component: () => import('../views/EstadoActual.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
