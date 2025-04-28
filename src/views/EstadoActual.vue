<template>
  <div class="container">
    <h1>Mi Billetera</h1>

    <div v-if="wallet.length" class="content-wrapper">
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

      <div class="chart-container">
        <Grafico :wallet="wallet" />
      </div>
    </div>

    <p v-else>No tienes criptomonedas en tu billetera.</p>

    <div class="total">
      <h3>Total en ARS: {{ formatCurrency(totalInARS) }}</h3>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";
import Grafico from "@/components/Grafico.vue";

export default {
  name: "EstadoActual",
  components: {
    Grafico,
  },
  data() {
    return {
      wallet: [],
      cryptoPrices: {},
      totalInARS: 0,
    };
  },
  async created() {
    await this.fetchWallet();
    await this.fetchCryptoPrices(); 
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

      this.wallet = Object.keys(balance)
        .filter((crypto) => balance[crypto] > 0)
        .map((crypto) => ({
          crypto_code: crypto,
          amount: balance[crypto],
          priceInARS: 0,
        }));

      this.fetchCryptoPrices();
    },
    async fetchCryptoPrices() {
      const cryptoCodes = this.wallet.map((crypto) => crypto.crypto_code);
      if (cryptoCodes.length === 0) return;

      try {
        const cryptoQuery = cryptoCodes.join(",");
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoQuery}&vs_currencies=ars`
        );

        this.wallet = this.wallet.map((crypto) => ({
          ...crypto,
          priceInARS: response.data[crypto.crypto_code]?.ars || 0,
        }));

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

.content-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin-top: 20px;
}

.table-container {
  flex: 1;
  max-width: 60%; /* Limitar el tamaño de la tabla */
  overflow-y: auto;
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
  padding: 10px; /* Reducir el tamaño de la tabla */
  text-align: left;
  border-bottom: 1px solid #2e3a4e;
  font-size: 14px; /* Reducir el tamaño de la fuente */
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

.chart-container {
  flex: 1;
  max-width: 40%; /* El gráfico ocupa menos espacio */
  height: 400px; /* Limitar la altura del gráfico */
  background-color: #161d2c;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.total {
  margin-top: 20px;
  text-align: center;
  color: #f0b90b;
  font-size: 20px;
  font-weight: bold;
}

p {
  color: #f0b90b;
  text-align: center;
  font-size: 16px;
}
</style>
