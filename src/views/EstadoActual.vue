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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(crypto, index) in wallet" :key="index">
              <td>{{ crypto.crypto_code }}</td>
              <td>{{ crypto.amount.toFixed(5) }}</td>
            </tr>
          </tbody>
        </table>
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
    };
  },
  async created() {
    await this.fetchWallet();
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
        .map((crypto) => ({ crypto_code: crypto, amount: balance[crypto] }));
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
</style>
