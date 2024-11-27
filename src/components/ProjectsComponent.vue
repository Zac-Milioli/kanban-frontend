<template>
  <div class="projects-container">
    <div class="header-bar">
      <h1>Meus Projetos</h1>
    </div>
    <div class="button-container">
      <button class="create-button" @click="showCreateProjectForm">Criar Projeto</button>
    </div>

    <div class="status-columns">
      <div v-for="status in projectStatuses" :key="status" class="status-section">
        <h2>{{ status }}</h2>
        <div class="cards-container">
          <div v-for="project in filteredProjects(status)" :key="project.id" class="project-card">
            <div @click="goToClientsActivities(project)" class="card-content">
              <h3>{{ project.nome }}</h3>
              <p>Status: {{ project.status }}</p>
            </div>
            <div class="card-actions">
              <button @click="editProject(project)">Editar</button>
              <button @click="deleteProject(project.id)">Excluir</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="form-container">
      <h2>{{ isEditing ? 'Editar Projeto' : 'Criar Novo Projeto' }}</h2>
      <form @submit.prevent="isEditing ? updateProject() : createProject()">
        <label for="nome">Nome:</label>
        <input type="text" v-model="form.nome" required />

        <label for="status">Status:</label>
        <select v-model="form.status" required>
          <option v-for="status in projectStatuses" :key="status" :value="status">{{ status }}</option>
        </select>

        <div class="form-buttons">
          <button type="submit">{{ isEditing ? 'Salvar' : 'Criar' }}</button>
          <button type="button" @click="cancelForm">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ProjectsComponent',
  data() {
    return {
      projects: [], // Lista de projetos inicializada vazia
      projectStatuses: ['Em andamento', 'Concluído', 'Cancelado'],
      showForm: false,
      isEditing: false,
      form: {
        id: null,
        nome: '',
        status: ''
      }
    };
  },
  methods: {
    filteredProjects(status) {
      return this.projects.filter(project => project.status === status);
    },
    goToClientsActivities(project) {
      this.$router.push(`/projects/${project.id}/clients-activities`);
    },
    showCreateProjectForm() {
      this.resetForm();
      this.showForm = true;
      this.isEditing = false;
    },
    async createProject() {
      try {
        await axios.post('http://127.0.0.1:5000/api/projeto', {
          nome: this.form.nome,
          status: this.form.status
        });
        this.fetchProjects(); // Atualiza a lista de projetos após a criação
        this.showForm = false;
      } catch (error) {
        console.error('Erro ao criar projeto:', error);
      }
    },
    editProject(project) {
      this.form = { ...project };
      this.showForm = true;
      this.isEditing = true;
    },
    async updateProject() {
      try {
        await axios.put(`http://127.0.0.1:5000/api/projeto/${this.form.id}`, {
          nome: this.form.nome,
          status: this.form.status
        });
        this.fetchProjects(); // Atualiza a lista de projetos após a atualização
        this.showForm = false;
      } catch (error) {
        console.error('Erro ao atualizar projeto:', error);
      }
    },
    async deleteProject(id) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/projeto/${id}`);
        this.fetchProjects(); // Atualiza a lista de projetos após a exclusão
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
      }
    },
    cancelForm() {
      this.showForm = false;
    },
    resetForm() {
      this.form = {
        id: null,
        nome: '',
        status: ''
      };
    },
    async fetchProjects() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/projeto');
        this.projects = response.data;
      } catch (error) {
        console.error('Erro ao buscar projetos:', error);
      }
    }
  },
  mounted() {
    this.fetchProjects();
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.projects-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding: 0; /* Remove padding */
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Garante que o contêiner ocupe toda a altura da tela */
  position: relative; /* Para posicionamento do formulário */
}

.header-bar {
  background-color: #0078d4; /* Azul da Microsoft */
  color: white;
  padding: 20px;
  text-align: left; /* Alinha o título à esquerda */
}

.header-bar h1 {
  margin: 0;
  font-size: 2.5em; /* Tamanho grande do título */
}

.button-container {
  display: flex;
  justify-content: center; /* Centraliza o botão horizontalmente */
  margin: 20px 0; /* Margem maior */
}

.create-button {
  background-color: #0078d4;
  color: white;
  border: none;
  width: 150px; /* Largura do botão */
  height: 50px; /* Altura do botão */
  cursor: pointer;
  white-space: nowrap; /* Impede quebras de linha no texto do botão */
  display: flex;
  align-items: center; /* Centraliza verticalmente */
  justify-content: center; /* Centraliza horizontalmente */
}

.create-button:hover {
  background-color: #005a9e;
}

.status-columns {
  display: flex;
  flex: 1; /* Faz com que o contêiner ocupe o espaço disponível */
}

.status-section {
  flex: 1; /* Faz com que cada seção ocupe o espaço disponível */
  border: 1px solid #e1dfdd; /* Adiciona a borda */
  margin: 10px; /* Margem entre as colunas */
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.project-card {
  background-color: #f3f2f1;
  border: 1px solid #e1dfdd;
  border-radius: 4px;
  padding: 20px;
  width: 300px;
  cursor: pointer;
}

.project-card:hover {
  background-color: #e1dfdd;
}

.card-content {
  margin-bottom: 10px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
}

.card-actions button {
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.card-actions button:hover {
  background-color: #005a9e;
}

.form-container {
  background-color: #f3f2f1;
  border: 1px solid #e1dfdd;
  border-radius: 4px;
  padding: 20px;
  width: 300px;
  position: absolute; /* Posicionamento absoluto */
  top: 50px; /* Distância do topo */
  left: 50%; /* Centraliza horizontalmente */
  transform: translateX(-50%); /* Ajusta a posição para centralizar */
  z-index: 10; /* Garante que o formulário fique sobre outros elementos */
}

.form-container form {
  display: flex;
  flex-direction: column;
}

.form-container label {
  margin-bottom: 5px;
}

.form-container input,
.form-container select {
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #e1dfdd;
  border-radius: 4px;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
}

.form-buttons button {
  background-color: #0078d4;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  margin-right: 10px; /* Margem entre os botões */
}

.form-buttons button:last-child {
  margin-right: 0; /* Remove a margem do último botão */
}

.form-buttons button:hover {
  background-color: #005a9e;
}
</style>