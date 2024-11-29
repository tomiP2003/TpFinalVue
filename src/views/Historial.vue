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
    background-color: bisque;
    width: 100%;
    border-radius: 1%;
  }
  
  .transactions-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
  }
  
  .table-container {
    max-height: 400px;
    overflow-y: auto;
    width: 100%;
    border: 1px solid #ccc;
  }
  
  .table {
    width: 100%;
    margin-top: 20px;
  }
  
  .table th,
  .table td {
    padding: 10px;
    text-align: center;
  }
  
  .botonfiltro {
    margin: 10px;
    text-align: right;
  }
  </style>
  