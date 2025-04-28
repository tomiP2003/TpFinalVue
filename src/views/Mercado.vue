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
            <th>Gráfico(7 días)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(coin, index) in filteredCoins" :key="coin.id">
            <td>{{ index + 1 }}</td>
            <td>{{ coin.name }}</td>
            <td>${{ coin.current_price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
            <td>${{ coin.current_price_ars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
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
  },
  methods: {
    async fetchCoins() {
      try {
        const usdResponse = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd", // Solo USD
              order: "market_cap_desc",
              per_page: 100,
              page: 1,
              sparkline: true,
            },
          }
        );

        const arsResponse = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "ars", // Solo ARS
              order: "market_cap_desc",
              per_page: 100,
              page: 1,
              sparkline: true,
            },
          }
        );

        const coinsWithPrices = usdResponse.data.map((coin, index) => ({
          ...coin,
          current_price_usd: coin.current_price,
          current_price_ars: arsResponse.data[index].current_price,
        }));

        this.coins = coinsWithPrices;
        console.log(this.coins);
      } catch (error) {
        console.error("Error al cargar las criptomonedas:", error);
        alert("No se pudo cargar la información del mercado.");
      }
    },
    sparklineToImage(sparklineData) {
      const hourlyData = sparklineData.filter((_, index) => index % 60 === 0);
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");

      const maxPrice = Math.max(...hourlyData);
      const minPrice = Math.min(...hourlyData);

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

      const guideLines = [minPrice, (maxPrice + minPrice) / 2, maxPrice];
      guideLines.forEach((value, index) => {
        const y = canvas.height - ((value - minPrice) / (maxPrice - minPrice)) * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
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

.table-container {
  overflow-y: auto;
  max-height: 400px;
  border-radius: 8px;
  margin: 0 auto;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.3);
  width: 100%;
  background-color: #161d2c;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: #161d2c;
  color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  margin: 0;
}
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #f0b90b;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-track {
  background-color: #0b111e;
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

.text-success {
  color: #00ff00;
}

.text-danger {
  color: #ff4d4d;
}

.sparkline {
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
