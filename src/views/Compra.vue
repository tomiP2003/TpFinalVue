<template>
  <div class="container">
    <h1>Compra de Criptomonedas</h1>
    <div class="form-container">
      <div class="card">
        <h3>Compra</h3>
        <form @submit.prevent="handleCompra">
          <div>
            <label for="SeleccionMonedaCompra">Criptomoneda</label>
            <select v-model="cryptoCodeCompra" id="SeleccionMonedaCompra" @change="fetchCryptoPriceCompra" required>
              <option value="">Seleccionar</option>
              <option value="bitcoin">Bitcoin</option>
              <option value="cardano">Ada-Cardano</option>
              <option value="usd-coin">USDC</option>
              <option value="ethereum">Ethereum</option>
              <option value="dai">DAI</option>
            </select>
          </div>
          <div>
            <label for="cryptoAmountCompra">Cantidad</label>
            <input
              type="number"
              id="cryptoAmountCompra"
              v-model.number="cryptoAmountCompra"
              @input="calculateMoneyCompra"
              min="0.00001"
              step="0.00001"
              required
              placeholder="0.0001"
            />
          </div>
          <div>
            <label for="moneyCompra">Monto pagado (en ARS)</label>
            <input
              type="number"
              id="moneyCompra"
              v-model.number="moneyCompra"
              :readonly="true"
              placeholder="Monto en pesos argentinos"
            />
          </div>
          <p v-if="cryptoPriceCompra">Precio actual: $ {{ cryptoPriceCompra.toFixed(2) }} ARS</p>
          <button type="submit" :disabled="!isValidCompra">Comprar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from 'sweetalert2';

export default {
  name: "Compra",
  data() {
    return {
      cryptoCodeCompra: "",
      cryptoAmountCompra: null,
      moneyCompra: null,
      cryptoPriceCompra: null,
    };
  },
  computed: {
    isValidCompra() {
      return this.cryptoCodeCompra && this.cryptoAmountCompra > 0 && this.cryptoPriceCompra > 0;
    },
  },
  methods: {
    async fetchCryptoPriceCompra() {
      if (!this.cryptoCodeCompra) {
        this.cryptoPriceCompra = null;
        return;
      }
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${this.cryptoCodeCompra}&vs_currencies=ars`
        );
        if (response.data[this.cryptoCodeCompra]) {
          this.cryptoPriceCompra = response.data[this.cryptoCodeCompra].ars;
          this.calculateMoneyCompra();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La criptomoneda seleccionada no está disponible.',
          });
          this.cryptoPriceCompra = null;
        }
      } catch (error) {
        console.error("Error al obtener el precio de la criptomoneda:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al obtener el precio de la criptomoneda.',
        });
      }
    },

    calculateMoneyCompra() {
      if (this.cryptoPriceCompra && this.cryptoAmountCompra > 0) {
        this.moneyCompra = (this.cryptoPriceCompra * this.cryptoAmountCompra).toFixed(2);
      } else {
        this.moneyCompra = null;
      }
    },

    async handleCompra() {
      if (!this.isValidCompra) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, completa todos los campos correctamente.',
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
        this.$router.push("/Compra");
        return;
      }

      const transaction = {
        user_id: userId,
        action: "purchase",
        crypto_code: this.cryptoCodeCompra,
        crypto_amount: this.cryptoAmountCompra.toFixed(5),
        money: this.moneyCompra,
        datetime: new Date().toISOString(),
      };

      const loadingSwal = Swal.fire({
        title: 'Realizando la compra...',
        text: 'Por favor espere.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

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
          title: 'Compra Exitosa',
          text: 'Compra registrada con éxito!',
        });
        this.$emit("update-wallet");
        console.log(response.data);
      } catch (error) {
        console.error("Error al realizar la compra:", error.response || error);
        if (error.response) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response.data.message || 'Hubo un problema al registrar la compra.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al realizar la compra.',
          });
        }
      } finally {
        loadingSwal.close();
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
