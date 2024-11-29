<template>
    <div class="container">
      <h1>Mercado de Criptomonedas</h1>
      <input v-model="search" placeholder="Buscar moneda" class="form-control" />
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Precio (USD)</th>
              <th>Precio (AR$)</th>
              <th>Variación (24h)</th>
              <th>Volumen Total</th>
              <th>Gráfico(7 dias)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(coin, index) in filteredCoins" :key="coin.id">
              <td>{{ index + 1 }}</td>
              <td>{{ coin.name }}</td>
              <td>${{ coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
              <td>
                ${{ (coin.current_price * conversionRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </td>
              <td :class="{'text-success': coin.price_change_percentage_24h > 0, 'text-danger': coin.price_change_percentage_24h < 0}">
                {{ coin.price_change_percentage_24h.toFixed(2) }}%
              </td>
              <td>${{ coin.total_volume.toLocaleString() }}</td>
              <td>
                <img :src="coin.sparkline_in_7d ? sparklineToImage(coin.sparkline_in_7d.price) : ''" alt="Gráfico" class="sparkline" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "Mercado",
    data() {
      return {
        coins: [], 
        search: "", 
        conversionRate: null,
      };
    },
    computed: {
      filteredCoins() {
        return this.coins.filter((coin) =>
          coin.name.toLowerCase().includes(this.search.toLowerCase())
        );
      },
    },
    created() {
      this.fetchCoins();
      this.fetchDollarRate();
    },
    methods: {
      async fetchCoins() {
        try {
          const response = await axios.get(
            "https://api.coingecko.com/api/v3/coins/markets",
            {
              params: {
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: 100,
                page: 1,
                sparkline: true,
              },
            }
          );
          this.coins = response.data;
        } catch (error) {
          console.error("Error al cargar las criptomonedas:", error);
          alert("No se pudo cargar la información del mercado.");
        }
      },
      async fetchDollarRate() {
        try {
          const response = await axios.get("https://api.bluelytics.com.ar/v2/latest");
        } catch (error) {
          console.error("Error al obtener el precio del dólar:", error);
          alert("No se pudo cargar la tasa de conversión.");
        }
      },
      sparklineToImage(sparklineData) {
  // Reducir datos para obtener una muestra por hora
  const hourlyData = sparklineData.filter((_, index) => index % 60 === 0);

  // Crear un canvas para el gráfico
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");

  // Escalar datos
  const maxPrice = Math.max(...hourlyData);
  const minPrice = Math.min(...hourlyData);

  // Dibujar área bajo la curva
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  hourlyData.forEach((price, index) => {
    const x = (index / hourlyData.length) * canvas.width;
    const y = canvas.height - ((price - minPrice) / (maxPrice - minPrice)) * canvas.height;
    ctx.lineTo(x, y);
  });
  ctx.lineTo(canvas.width, canvas.height);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 123, 255, 0.2)";
  ctx.fill();

  // Dibujar línea del gráfico
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - ((hourlyData[0] - minPrice) / (maxPrice - minPrice)) * canvas.height);
  hourlyData.forEach((price, index) => {
    const x = (index / hourlyData.length) * canvas.width;
    const y = canvas.height - ((price - minPrice) / (maxPrice - minPrice)) * canvas.height;
    ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar líneas guía
  const guideLines = [minPrice, (maxPrice + minPrice) / 2, maxPrice];
  guideLines.forEach((value, index) => {
    const y = canvas.height - ((value - minPrice) / (maxPrice - minPrice)) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"; // Líneas guía en gris claro
    ctx.lineWidth = 1;
    ctx.stroke();

  });

  return canvas.toDataURL();
},

    },
  };
  </script>
  
  <style scoped>
  .container {
    
    margin: 20px auto;
    width: 90%;
    background-color: none;
    padding: 20px;
    border-radius: 10px;
  }
  
  .table-container {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .table {
    margin-top: 20px;
    width: 100%;
    background-color: aqua;
  }
  
  .text-success {
    color: green;
  }
  
  .text-danger {
    color: red;
  }
  
  .form-control {
    margin-bottom: 20px;
    padding: 10px;
    width: 80%;
  }
  
  .sparkline {
    width: 100px;
    height: 20px;
  }
  </style>
  