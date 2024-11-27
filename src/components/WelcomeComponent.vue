<template>
  <div class="welcome">
    <h1 class="fade-in">Bem vindo!</h1>
    <button @click="goToProjects">Ir para "Meus Projetos"</button>
  </div>
</template>

<script>
export default {
  name: 'WelcomeComponent',
  methods: {
    goToProjects() {
      this.$router.push('/projects');
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.welcome {
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #0078d4, #ffffff);
}

.fade-in {
  animation: fadeIn 4s;
  font-size: 10em; /* Título grande */
  margin-bottom: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

button {
  background-color: #0078d4; /* Azul da Microsoft */
  color: white;
  border: none;
  padding: 15px 30px; /* Botão maior */
  font-size: 1.2em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #005a9e; /* Azul mais escuro ao passar o mouse */
}
</style>