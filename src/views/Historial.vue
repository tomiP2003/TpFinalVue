<template>
  <div class="container">
    <h1>Historial de Transacciones</h1>
    <div class="botonfiltro">
      <button @click="toggleUserFilter" class="btn btn-primary">
        {{ showUserTransactions ? 'Ver todas las transacciones' : 'Ver solo mis transacciones' }}
      </button>
    </div>
    <div v-if="filteredTransactions.length > 0" class="transactions-wrapper">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Acción</th>
              <th>Criptomoneda</th>
              <th>Cantidad</th>
              <th>Monto (ARS)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction._id">
              <td>{{ transaction.datetime }}</td>
              <td>{{ transaction.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
              <td>{{ transaction.crypto_code }}</td>
              <td>{{ transaction.crypto_amount }}</td>
              <td>${{ transaction.money }}</td>
              <td>
                <button @click="showEditModal(transaction)" class="btn btn-edit">Editar</button>
                <button @click="deleteTransaction(transaction._id)" class="btn btn-delete">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p>No hay transacciones registradas.</p>
    </div>

    <!-- Modal de Edición -->
    <div v-if="editedTransaction._id" class="modal">
      <div class="modal-content">
        <h3>Editar Transacción</h3>
        <label>Criptomoneda:</label>
        <input v-model="editedTransaction.crypto_code" disabled />

        <label>Cantidad:</label>
        <input type="number" v-model="editedTransaction.crypto_amount" @input="calculatePrice" />

        <label>Monto (ARS):</label>
        <input type="number" v-model="editedTransaction.money" readonly />

        <div>
          <button @click="saveTransaction" class="btn btn-save">Guardar</button>
          <button @click="closeEditModal" class="btn btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'TransactionHistory',
  data() {
    return {
      transactions: [],
      showUserTransactions: true,
      editedTransaction: {
        _id: '',
        crypto_code: '',
        crypto_amount: 0,
        money: 0,
        action: '',
        datetime: '',
      },
      cryptoPrices: {},
    };
  },
  computed: {
    filteredTransactions() {
      const userId = localStorage.getItem('userId');
      let transactions = this.showUserTransactions
        ? this.transactions.filter(transaction => transaction.user_id === userId)
        : this.transactions;
      transactions.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

      return transactions;
    },
  },
  created() {
    this.fetchAllTransactions();
    this.fetchCryptoPrices();
  },
  methods: {
    async fetchAllTransactions() {
      try {
        const response = await axios.get('https://laboratorio-36cf.restdb.io/rest/transactions', {
          headers: {
            'x-apikey': '64a5ccf686d8c5d256ed8fce',
          },
        });
        this.transactions = response.data;
      } catch (error) {
        console.error('Error al obtener las transacciones:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudo obtener el historial de transacciones.',
        });
      }
    },

    async fetchCryptoPrices() {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=ars');
        this.cryptoPrices = response.data;
      } catch (error) {
        console.error('Error al obtener los precios de las criptomonedas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudo obtener los precios de las criptomonedas.',
        });
      }
    },

    calculatePrice() {
      const price = this.cryptoPrices[this.editedTransaction.crypto_code.toLowerCase()];
      if (price) {
        // Calcula el monto total en ARS
        this.editedTransaction.money = this.editedTransaction.crypto_amount * price.ars;
      }
    },

    showEditModal(transaction) {
      this.editedTransaction = { ...transaction };
      this.calculatePrice();
    },

    // Guardar cambios realizados en la transacción
    async saveTransaction() {
      try {
        const response = await axios.put(`https://laboratorio-36cf.restdb.io/rest/transactions/${this.editedTransaction._id}`, this.editedTransaction, {
          headers: {
            'x-apikey': '64a5ccf686d8c5d256ed8fce',
          },
        });

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Transacción actualizada correctamente.',
        });

        this.fetchAllTransactions();
        this.closeEditModal();
      } catch (error) {
        console.error('Error al guardar la transacción:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudo guardar la transacción.',
        });
      }
    },

    closeEditModal() {
      this.editedTransaction = {
        _id: '',
        crypto_code: '',
        crypto_amount: 0,
        money: 0,
        action: '',
        datetime: '',
      };
    },

    async deleteTransaction(transactionId) {
      try {
        await axios.delete(`https://laboratorio-36cf.restdb.io/rest/transactions/${transactionId}`, {
          headers: {
            'x-apikey': '64a5ccf686d8c5d256ed8fce',
          },
        });

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Transacción eliminada correctamente.',
        });

        this.fetchAllTransactions();
      } catch (error) {
        console.error('Error al eliminar la transacción:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se pudo eliminar la transacción.',
        });
      }
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

.transactions-wrapper {
  margin-top: 20px;
}

.table-container {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 8px;
  margin: 0 auto;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #161d2c;
  color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
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

.btn-edit {
  background-color: #0d6efd;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-edit:hover {
  background-color: #0a58ca;
}

.btn-delete {
  background-color: #dc3545;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-delete:hover {
  background-color: #c82333;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #161d2c;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  color: #ffffff;
  text-align: center;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #2e3a4e;
  border-radius: 5px;
  background-color: #161d2c;
  color: #ffffff;
}

button {
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  margin: 10px;
}

.btn-save {
  background-color: #28a745;
}

.btn-save:hover {
  background-color: #218838;
}

.btn-cancel {
  background-color: #dc3545;
}

.btn-cancel:hover {
  background-color: #c82333;
}
</style>
