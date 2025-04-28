<template>
  <div class="container">
    <h1>Venta de Criptomonedas</h1>
    <div v-if="wallet.length">
      <div class="form-container">
        <div class="card">
          <h3>Venta</h3>
          <form @submit.prevent="handleVenta">
            <div>
              <label for="SeleccionMonedaVenta">Criptomoneda</label>
              <select v-model="cryptoCodeVenta" id="SeleccionMonedaVenta" @change="fetchCryptoPriceVenta" required>
                <option value="">Seleccionar</option>
                <option v-for="crypto in wallet" :key="crypto.crypto_code" :value="crypto.crypto_code">
                  {{ crypto.crypto_code }}
                </option>
              </select>
            </div>
            <div>
              <label for="cryptoAmountVenta">Cantidad</label>
              <input
                type="number"
                id="cryptoAmountVenta"
                v-model.number="cryptoAmountVenta"
                @input="calculateMoneyVenta"
                min="0.00001"
                step="0.00001"
                required
                placeholder="0.0001"
                :max="getMaxAmount"
              />
            </div>
            <div>
              <label for="moneyVenta">Monto recibido (en ARS)</label>
              <input
                type="number"
                id="moneyVenta"
                v-model.number="moneyVenta"
                :readonly="true"
                placeholder="Monto en pesos argentinos"
              />
            </div>
            <p v-if="cryptoPriceVenta">Precio actual: $ {{ cryptoPriceVenta.toFixed(2) }} ARS</p>
            <button type="submit" :disabled="!isValidVenta">Vender</button>
          </form>
        </div>
      </div>
    </div>
    <p v-else>No tienes criptomonedas en tu billetera.</p>
  </div>
</template>
<script>
import axios from "axios";
import Swal from 'sweetalert2';

export default {
  name: "Venta",
  data() {
    return {
      cryptoCodeVenta: "",
      cryptoAmountVenta: null,
      moneyVenta: null,
      cryptoPriceVenta: null,
      wallet: [],
    };
  },
  computed: {
    isValidVenta() {
      return (
        this.cryptoCodeVenta &&
        this.cryptoAmountVenta > 0 &&
        this.cryptoAmountVenta <= this.getMaxAmount && 
        this.cryptoPriceVenta > 0
      );
    },
    getMaxAmount() {
      const crypto = this.wallet.find((crypto) => crypto.crypto_code === this.cryptoCodeVenta);
      return crypto ? crypto.amount : 0;
    },
  },
  async created() {
    await this.fetchWallet();
  },
  methods: {
    async fetchCryptoPriceVenta() {
      if (!this.cryptoCodeVenta) {
        this.cryptoPriceVenta = null;
        return;
      }

      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${this.cryptoCodeVenta}&vs_currencies=ars`
        );
        this.cryptoPriceVenta = response.data[this.cryptoCodeVenta].ars;
        this.calculateMoneyVenta();
      } catch (error) {
        console.error("Error al obtener el precio de la criptomoneda:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el precio de la criptomoneda.',
        });
      }
    },

    calculateMoneyVenta() {
      if (this.cryptoPriceVenta && this.cryptoAmountVenta > 0) {
        if (this.cryptoAmountVenta > this.getMaxAmount) {
          this.cryptoAmountVenta = this.getMaxAmount;
        }
        this.moneyVenta = (this.cryptoPriceVenta * this.cryptoAmountVenta).toFixed(2);
      } else {
        this.moneyVenta = null;
      }
    },

    async fetchWallet() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        Swal.fire({
          icon: 'warning',
          title: 'Usuario no autenticado',
          text: 'Redirigiendo a la página de login...',
        });
        this.$router.push("/HomeView");
        return;
      }
      try {
        const response = await axios.get(
          "https://laboratorio-36cf.restdb.io/rest/transactions",
          {
            headers: {
              "x-apikey": "64a5ccf686d8c5d256ed8fce",
            },
          }
        );

        const transactions = response.data.filter((tx) => tx.user_id === userId);
        this.calculateWallet(transactions);
      } catch (error) {
        console.error("Error al obtener las transacciones:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la billetera.',
        });
      }
    },

    calculateWallet(transactions) {
      const balance = {};

      transactions.forEach((tx) => {
        const cryptoCode = tx.crypto_code.toLowerCase();
        
        if (!balance[cryptoCode]) {
          balance[cryptoCode] = 0;
        }

        balance[cryptoCode] += tx.action === "purchase"
          ? parseFloat(tx.crypto_amount)
          : -parseFloat(tx.crypto_amount);
      });

      this.wallet = Object.keys(balance)
        .filter((crypto) => balance[crypto] > 0) 
        .map((crypto) => ({
          crypto_code: crypto,
          amount: balance[crypto],
        }));
    },

    async handleVenta() {
      if (!this.isValidVenta) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, completa todos los campos correctamente y asegúrate de que no estás vendiendo más de lo que tienes.',
        });
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        Swal.fire({
          icon: 'warning',
          title: 'Usuario no autenticado',
          text: 'Redirigiendo a la página de login...',
        });
        this.$router.push("/HomeView");
        return;
      }

      const transaction = {
        user_id: userId,
        action: "sale",
        crypto_code: this.cryptoCodeVenta,
        crypto_amount: this.cryptoAmountVenta.toFixed(5),
        money: this.moneyVenta,
        datetime: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          "https://laboratorio-36cf.restdb.io/rest/transactions",
          transaction,
          {
            headers: {
              "x-apikey": "64a5ccf686d8c5d256ed8fce",
              "Content-Type": "application/json",
            },
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Venta Exitosa',
          text: 'Venta registrada con éxito!',
        });
        this.$emit("update-wallet");
        console.log(response.data);
      } catch (error) {
        console.error("Error al realizar la venta:", error.response || error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al registrar la venta.',
        });
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
}

h1 {
  text-align: center;
  color: #333;
}

.form-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.card {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 300px;
}

.card h3 {
  text-align: center;
  color: #333;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
button {
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #218838;
}

p {
  font-size: 14px;
  color: #555;
}
</style>
