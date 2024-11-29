<template>
  <div class="container">
    <h1>Compra de Criptomonedas</h1>
    <div class="form-container">
      <div class="card compra">
        <h3>Compra</h3>
        <form @submit.prevent="handleCompra">
          <div>
            <label for="SeleccionMoneda">Criptomoneda</label>
            <select v-model="cryptoCode" id="SeleccionMoneda" @change="fetchCryptoPrice" required>
              <option value="">Seleccionar</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="cardano">Ada-Cardano</option>
              <option value="usd-coin">USDC</option>
              <option value="ethereum">Ethereum</option>
              <option value="dai">DAI</option>
            </select>
          </div>
          <div>
            <label for="cryptoAmount">Cantidad</label>
            <input
              type="number"
              id="cryptoAmount"
              v-model.number="cryptoAmount"
              @input="calculateMoney"
              min="0.00001"
              step="0.00001"
              required
              placeholder="0.0001"
            />
          </div>
          <div>
            <label for="money">Monto pagado (en ARS)</label>
            <input
              type="number"
              id="money"
              v-model.number="money"
              :readonly="true"
              placeholder="Monto en pesos argentinos"
            />
          </div>
          <p v-if="cryptoPrice">Precio actual: $ {{ cryptoPrice.toFixed(2) }} ARS</p>
          <button type="submit">Comprar</button>
        </form>
      </div>
      <div class="card venta">
        <h3>Venta</h3>
        <form @submit.prevent="handleVenta">
          <div>
            <label for="SeleccionMoneda">Criptomoneda</label>
            <select v-model="cryptoCode" id="SeleccionMoneda" @change="fetchCryptoPrice" required>
              <option value="">Seleccionar</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="cardano">Ada-Cardano</option>
              <option value="usd-coin">USDC</option>
              <option value="ethereum">Ethereum</option>
              <option value="dai">DAI</option>
            </select>
          </div>
          <div>
            <label for="cryptoAmount">Cantidad</label>
            <input
              type="number"
              id="cryptoAmount"
              v-model.number="cryptoAmount"
              @input="calculateMoney"
              min="0.00001"
              step="0.00001"
              required
              placeholder="0.0001"
            />
          </div>
          <div>
            <label for="money">Monto a Vender (en ARS)</label>
            <input
              type="number"
              id="money"
              v-model.number="money"
              :readonly="true"
              placeholder="Monto en pesos argentinos"
            />
          </div>
          <p v-if="cryptoPrice">Precio actual: $ {{ cryptoPrice.toFixed(2) }} ARS</p>
          <button type="submit">Vender</button>
        </form>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "HomeView",
  data() {
    return {
      cryptoCode: "",
      cryptoAmount: null,
      money: null,
      cryptoPrice: null,
    };
  },
  methods: {
    async fetchCryptoPrice() {
      if (!this.cryptoCode) {
        this.cryptoPrice = null;
        return;
      }

      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${this.cryptoCode}&vs_currencies=ars`
        );

        this.cryptoPrice = response.data[this.cryptoCode].ars;
        this.calculateMoney();
      } catch (error) {
        console.error("Error al obtener el precio de la criptomoneda:", error);
        alert("No se pudo obtener el precio actual. Intenta nuevamente.");
      }
    },
    calculateMoney() {
      if (this.cryptoPrice && this.cryptoAmount > 0) {
        this.money = (this.cryptoPrice * this.cryptoAmount).toFixed(2);
      } else {
        this.money = null;
      }
    },
    async handleCompra() {
      if (!this.cryptoCode || this.cryptoAmount <= 0 || this.money <= 0) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
      }

      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Usuario no autenticado. Redirigiendo...");
        this.$router.push("/login");
        return;
      }

      const transaction = {
        user_id: userId,
        action: "purchase",
        crypto_code: this.cryptoCode,
        crypto_amount: this.cryptoAmount.toFixed(5),
        money: this.money,
        datetime: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          "https://laboratorio3-f36a.restdb.io/rest/transactions",
          transaction,
          {
            headers: {
              "x-apikey": "60eb09146661365596af552f",
              "Content-Type": "application/json",
            },
          }
        );
        alert("Compra registrada con éxito!");
        console.log(response.data);
      } catch (error) {
        console.error("Error al realizar la compra:", error.response || error);
        alert(
          `Hubo un problema al registrar la compra. Detalles: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },

    async handleVenta() {
      if (!this.cryptoCode || this.cryptoAmount <= 0 || this.money <= 0) {
        alert("Por favor, completa todos los campos correctamente.");
        return;
      }

      // Obtener el user_id desde el localStorage
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Usuario no autenticado. Redirigiendo...");
        this.$router.push("/login");
        return;
      }

      const transaction = {
        user_id: userId,
        action: "sale",
        crypto_code: this.cryptoCode,
        crypto_amount: this.cryptoAmount.toFixed(5),
        money: this.money,
        datetime: new Date().toISOString(),
      };

      try {
        const response = await axios.post(
          "https://laboratorio3-f36a.restdb.io/rest/transactions",
          transaction,
          {
            headers: {
              "x-apikey": "60eb09146661365596af552f",
              "Content-Type": "application/json",
            },
          }
        );
        alert("Venta registrada con éxito!");
        console.log(response.data);
      } catch (error) {
        console.error("Error al realizar la venta:", error.response || error);
        alert(
          `Hubo un problema al registrar la venta. Detalles: ${
            error.response?.data?.message || error.message
          }`
        );
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
  justify-content: space-between;
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
  background-color: #007bff;
  color: #fff;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
p {
  font-size: 14px;
  color: #555;
}
</style>