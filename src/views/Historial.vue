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
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction._id">
                <td>{{ transaction.datetime }}</td>
                <td>{{ transaction.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
                <td>{{ transaction.crypto_code }}</td>
                <td>{{ transaction.crypto_amount }}</td>
                <td>${{ transaction.money }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else>
        <p>No hay transacciones registradas.</p>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TransactionHistory',
    data() {
      return {
        transactions: [],
        showUserTransactions: true,
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
    },
    methods: {
      async fetchAllTransactions() {
        try {
          const response = await axios.get('https://laboratorio3-f36a.restdb.io/rest/transactions', {
            headers: {
              'x-apikey': '60eb09146661365596af552f',
            },
          });
          this.transactions = response.data;
        } catch (error) {
          console.error('Error al obtener las transacciones:', error);
          alert('No se pudo obtener el historial de transacciones.');
        }
      },
      toggleUserFilter() {
        this.showUserTransactions = !this.showUserTransactions;
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
.table-container::-webkit-scrollbar {
  width: 8px; /* Ancho de la barra de desplazamiento */
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #f0b90b; /* Color del "pulgar" de la barra */
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-track {
  background-color: #0b111e; /* Fondo del track de la barra */
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
  background-color: #f0b90b;
  color: #0b111e;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-edit:hover {
  background-color: #d4a507;
}

.btn-delete {
  background-color: #ff4d4d;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-delete:hover {
  background-color: #c84343;
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

.form-control {
  margin: 20px auto;
  display: block;
  padding: 10px;
  border: 1px solid #2e3a4e;
  border-radius: 5px;
  width: 80%;
  background-color: #161d2c;
  color: #ffffff;
  text-align: center;
}

.form-control::placeholder {
  color: #888;
}

button {
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.text-success {
  color: #00ff00;
}

.text-danger {
  color: #ff4d4d;
}
</style>