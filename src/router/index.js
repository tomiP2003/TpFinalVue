import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Compra from '../views/Compra.vue';
import Venta from '@/views/Venta.vue';
import Mercado from '../views/Mercado.vue';
import Historial from '../views/Historial.vue';
import EstadoActual from '../views/EstadoActual.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/compra',
    name: 'compra',
    component: Compra,
  },
  {
    path: '/Venta',
    name: 'Venta',
    component: Venta,
  },
  {
    path: '/mercado',
    name: 'mercado',
    component: Mercado,
  },
  {
    path: '/historial',
    name: 'historial',
    component: Historial,
  },
  {
    path: '/estado-actual',
    name: 'estado-actual',
    component: EstadoActual,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
