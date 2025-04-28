<template>
  <div>
    <PieChart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export default {
  name: 'Grafico',
  components: {
    PieChart: Pie,
  },
  props: {
    wallet: {
      type: Array,
      required: true,
    },
  },
  computed: {
    chartData() {
      const labels = this.wallet.map(crypto => crypto.crypto_code);
      const data = this.wallet.map(crypto => crypto.amount * crypto.priceInARS); 

      return {
        labels: labels,
        datasets: [
          {
            label: 'Valor total en ARS',
            data: data,
            backgroundColor: ['#f0b90b', '#e54b4b', '#0d172a', '#00b894', '#0984e3'], 
            borderColor: '#ffffff',
            borderWidth: 1,
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return `${tooltipItem.label}: $${tooltipItem.raw.toLocaleString()}`; 
              },
            },
          },
        },
      };
    },
  },
};
</script>

<style scoped>

div {
  width: 90%;
  height: 90%;
}
</style>
