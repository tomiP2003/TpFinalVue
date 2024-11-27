<template>
  <header>
  <h1>CriptoYa</h1>

	</header>

  <div class="container">
	<div class="d-flex justify-content-center h-100">
		<div class="card">
			<div class="card-header">
				<h3>Iniciar Sesion</h3>
			</div>
			<div class="card-body">
				<form v-on:submit.prevent="login">
					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-user"></i></span>
						</div>
						<input type="text" class="form-control" placeholder="Usuario" v-model="usuario">
						
					</div>
					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-key"></i></span>
						</div>
						<input type="password" class="form-control" placeholder="Contraseña" v-model="password">
					</div>
					<div class="form-group">
						<input type="submit" value="Ingresar" class="btn float-right login_btn">
					</div>
				</form>
			</div>
			<div class="card-footer">
				<div class="d-flex justify-content-center links">
					No tienes cuenta? <a href="#">Registrate Aca</a>
				</div>
				<div class="d-flex justify-content-center">
					<a href="#">¿Olvidaste tu contraseña?</a>
				</div>
			</div>
		</div>
	</div>
  </div>

</template>

<script>
import '@/assets/styles/Login.css'
export default {
  name: 'HomeView',
  components: {
    
  },
  data() {
    return {
      usuario: "",
      password: "",
    };
  },
  methods: {
    login() {
      if (this.usuario.trim() === "" || this.password.trim() === "") {
        alert("Por favor, completa todos los campos.");
        return;
      }

      localStorage.setItem("userId", this.usuario);

      this.$router.push("/Criptosya");
    },
  },
}
</script>

<style scoped>
    header {
        padding: 10px 20px;
        margin: 0;
        width: 100%;
    }
    
    h1 {
        text-align: left;
        margin: 0;
        padding-top: 0;
        color: hwb(175 32% 16%);
    }
    
    .container {
        margin-top: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100%;
    }
    
    .card {
        width: 400px;
        background-color: rgba(0, 0, 0, 0.5) !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 30px;
        border-radius: 10px;
        height: auto;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    }
    
    .card-header h3 {
        color: white;
        text-align: center;
        margin-bottom: 20px; 
    }
    
    .card-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .input-group {
        width: 100%;
        margin-bottom: 20px;
        position: relative;
    }
    
    .input-group-prepend {
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
    }
    
    .input-group-prepend span {
        width: 40px;
        background-color: #FFC312;
        color: black;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 5px;
        box-sizing: border-box;
        text-align: left;
    }
    
    input {
        width: 100%;
        padding: 12px ;
        padding-right: 50px;
        border: 2px solid #FFC312;
        border-radius: 5px;
        background-color: #333;
        color: white;
        font-size: 16px;
        transition: all 0.3s ease;
    }
    
    input:focus {
        outline: none;
        box-shadow: 0 0 8px rgba(255, 195, 18, 0.8);
        border-color: #FF5733;
    }
    
    input::placeholder {
        color: #ddd;
        opacity: 1;
        text-align: left;
    }
    .input-group:nth-child(1) input, .input-group:nth-child(2) input {
        margin-left: -35px;
        margin-right: -20px;
    }
    .login_btn {
        color: black;
        background-color: #FFC312;
        width: 100%;
        padding: 10px;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .login_btn:hover {
        background-color: #FF5733;
        color: white;
    }
    
    .card-footer {
        text-align: center;
        color: white;
    }
    
    .links a {
        margin-left: 4px;
        text-decoration: none;
        color: #FFC312;
    }
    
    .links a:hover {
        text-decoration: underline;
    }
    
    .social_icon {
        position: absolute;
        right: 20px;
        top: -45px;
    }
    
    .social_icon span {
        font-size: 60px;
        margin-left: 10px;
        color: #FFC312;
    }
    
    .social_icon span:hover {
        color: white;
        cursor: pointer;
    }
    </style>
