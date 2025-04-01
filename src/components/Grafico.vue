<template>
  <div>
    <PieChart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Registrar los componentes necesarios para gráficos de pastel
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

export default {
  name: 'Grafico',
  components: {
    PieChart: Pie, // Usamos el componente Pie en lugar de Line
  },
  props: {
    wallet: {
      type: Array,
      required: true,
    },
  },
  computed: {
    // Preparar los datos para el gráfico de pastel
    chartData() {
      const labels = this.wallet.map(crypto => crypto.crypto_code); // Nombres de criptos
      const data = this.wallet.map(crypto => crypto.amount * crypto.priceInARS); // Total en ARS de cada cripto

      return {
        labels: labels,
        datasets: [
          {
            label: 'Valor total en ARS',
            data: data,
            backgroundColor: ['#f0b90b', '#e54b4b', '#0d172a', '#00b894', '#0984e3'], // Colores de las porciones del gráfico
            borderColor: '#ffffff',
            borderWidth: 1,
          },
        ],
      };
    },
    // Configurar las opciones del gráfico de pastel
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
                return `${tooltipItem.label}: $${tooltipItem.raw.toLocaleString()}`; // Mostrar la cantidad en ARS
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
/* Estilo opcional para el gráfico */
div {
  width: 100%;
  height: 100%;
}
</style>
