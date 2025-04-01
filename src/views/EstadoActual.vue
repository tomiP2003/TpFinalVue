<template>
  <div class="container">
    <h1>Mi Billetera</h1>

    <div v-if="wallet.length">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Criptomoneda</th>
              <th>Cantidad</th>
              <th>Precio en ARS</th>
              <th>Total en ARS</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(crypto, index) in wallet" :key="index">
              <td>{{ crypto.crypto_code }}</td>
              <td>{{ crypto.amount.toFixed(5) }}</td>
              <td>{{ formatCurrency(crypto.priceInARS) || 'Cargando...' }}</td>
              <td>{{ formatCurrency(crypto.priceInARS ? crypto.amount * crypto.priceInARS : 0) || 'Cargando...' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Total wallet value in ARS -->
      <div class="total">
        <h3>Total en ARS: {{ formatCurrency(totalInARS) }}</h3>
      </div>
    </div>

    <p v-else>No tienes criptomonedas en tu billetera.</p>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "WalletView",
  data() {
    return {
      wallet: [],
      cryptoPrices: {}, // Guardamos los precios de las criptomonedas
      totalInARS: 0, // El total en ARS
    };
  },
  async created() {
    await this.fetchWallet();
    await this.fetchCryptoPrices(); // Obtenemos los precios de las criptos
  },
  methods: {
    async fetchWallet() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        Swal.fire({
          icon: "warning",
          title: "Usuario no autenticado",
          text: "Redirigiendo a la página de login...",
        });
        this.$router.push("/HomeView");
        return;
      }

      try {
        const response = await axios.get(
          "https://laboratorio-36cf.restdb.io/rest/transactions",
          {
            headers: {
              "x-apikey": "64a5ccf686d8c5d256ed8fce", // API key
            },
          }
        );

        const transactions = response.data.filter((tx) => tx.user_id === userId);
        this.calculateWallet(transactions);
      } catch (error) {
        console.error("Error al obtener las transacciones:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la billetera.",
        });
      }
    },
    calculateWallet(transactions) {
      const balance = {};

      transactions.forEach((tx) => {
        if (!balance[tx.crypto_code]) {
          balance[tx.crypto_code] = 0;
        }
        balance[tx.crypto_code] += tx.action === "purchase"
          ? parseFloat(tx.crypto_amount)
          : -parseFloat(tx.crypto_amount);
      });

      // Solo agregamos las criptos con saldo positivo
      this.wallet = Object.keys(balance)
        .filter((crypto) => balance[crypto] > 0)
        .map((crypto) => ({
          crypto_code: crypto,
          amount: balance[crypto],
          priceInARS: 0, // Inicializamos el precio en 0 por ahora
        }));

      // Ahora que tenemos todas las criptos en la billetera, obtenemos los precios
      this.fetchCryptoPrices();
    },
    async fetchCryptoPrices() {
      const cryptoCodes = this.wallet.map((crypto) => crypto.crypto_code); // Obtener todos los códigos de las criptos en la billetera
      if (cryptoCodes.length === 0) return; // Si no hay criptos en la billetera, no hacemos nada

      try {
        // Convertir los códigos de las criptos a un string para la consulta de la API
        const cryptoQuery = cryptoCodes.join(",");
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoQuery}&vs_currencies=ars`
        );

        // Asignar los precios obtenidos a las criptos en la billetera
        this.wallet = this.wallet.map((crypto) => ({
          ...crypto,
          priceInARS: response.data[crypto.crypto_code]?.ars || 0, // Si no existe el precio, asignar 0
        }));

        // Recalcular el total de la billetera en ARS
        this.calculateTotalInARS();
      } catch (error) {
        console.error("Error al obtener los precios:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo obtener el precio de las criptomonedas.",
        });
      }
    },
    calculateTotalInARS() {
      this.totalInARS = this.wallet.reduce((total, crypto) => {
        return total + (crypto.amount * crypto.priceInARS);
      }, 0);
    },
    // Formatear el número como moneda ARS (con puntos y comas)
    formatCurrency(value) {
      if (value === undefined || value === null) return 'Cargando...';

      return new Intl.NumberFormat("es-AR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    },
  },
};
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  color: #ffffff;
  background-color: #0b111e;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #f0b90b;
  font-size: 28px;
  font-weight: bold;
}

.table-container {
  margin-top: 20px;
  overflow-y: auto;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #161d2c;
  color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

.table th,
.table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #2e3a4e;
  font-size: 16px;
}

.table th {
  background-color: #0d172a;
  color: #f0b90b;
  text-transform: uppercase;
  font-weight: bold;
}

.table tbody tr:hover {
  background-color: #1f293d;
  cursor: pointer;
}

p {
  color: #f0b90b;
  text-align: center;
  font-size: 16px;
}

.total {
  margin-top: 20px;
  text-align: center;
  color: #f0b90b;
  font-size: 20px;
  font-weight: bold;
}
</style>
