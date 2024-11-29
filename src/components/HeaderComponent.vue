<template>
  <header class="Head">
    <nav v-if="userId">
      <span class="left">Hola, {{ userId }}!</span>
      <div class="right">
        <a href="/Criptosya" class="nav-link">Compra-Venta</a>
        <a href="/Mercado" class="nav-link">Mercado</a>
        <a href="/Historial" class="nav-link">Historial</a>
        <a href="EstadoActual" class="nav-link">Estado Actual</a>
        <a @click.prevent="logout" class="logout-link">Logout</a>
      </div>
    </nav>
  </header>
</template>
  <script>
  import { useRouter } from 'vue-router';
  export default {
    name: 'HeaderComponent',
    data() {
      return {
        userId: localStorage.getItem('userId'),
      };
    },
    methods: {
      goTo(routeName) {
        const router = useRouter();
        router.push({ name: routeName });
      },
      logout() {
        localStorage.removeItem('userId');
        this.$router.push('/');
      },
    },
  };
  </script>

  <style scoped>
  body{
    margin: 0;
    padding: 0;
}
.Head {
    background-color: #072c3d;
    padding: 10px 20px;
    border-bottom: 2px solid #ccc;
    padding: 0;
    margin: 0;
    width: 100%;
  }
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center; 
    width: 95%; 
  }
  .left {
    font-size: 18px;
    font-weight: bold;
    color: white;
  }
  .right {
    display: flex;
    gap: 15px;
  }
  .nav-link,
  .logout-link {
    font-size: 16px;
    font-weight: normal;
    text-decoration: none;
    color: #007bff;
    cursor: pointer;
  }
  .nav-link:hover,
  .logout-link:hover {
    font-weight: bold;
  }
  .logout-link {
    color: #d32f2f;
  }
  .logout-link:hover {
    color: #c2185b;
  }
  .nav-link:active,
  .nav-link:focus,
  .logout-link:active,
  .logout-link:focus {
    background: none;
    outline: none;
  }
</style>