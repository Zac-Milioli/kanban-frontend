<template>
  <div class="page-container">
    <div class="header-bar">
      <h1>Clientes e Atividades</h1>
    </div>
    <div class="content">
      <div class="column bordered">
        <div class="section-header">
          <h2>Clientes</h2>
          <button @click="showCreateClientForm">Adicionar Cliente</button>
        </div>
        <div class="cards-container">
          <div v-for="client in clients" :key="client.id" class="card" @click="selectClient(client)">
            <h3>{{ client.nome }}</h3>
            <button @click.stop="editClient(client)">Editar</button>
            <button @click.stop="deleteClient(client.id)">Excluir</button>
          </div>
        </div>
      </div>
      <div class="column bordered">
        <div class="section-header">
          <h2>{{ selectedClient ? `Atividades de ${selectedClient.nome}` : 'Todas as atividades do projeto' }}</h2>
          <button v-if="selectedClient" @click="showCreateActivityForm">Adicionar Atividade</button>
        </div>
        <div class="cards-container">
          <div v-for="activity in filteredActivities" :key="activity.id" class="card">
            <h3>{{ activity.nome }}</h3>
            <p>Cliente: {{ getClientName(activity.cliente_id) }}</p>
            <button @click="editActivity(activity)">Editar</button>
            <button @click="deleteActivity(activity.id)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário de Cliente -->
    <div v-if="showClientForm" class="form-container">
      <h2>{{ isEditingClient ? 'Editar Cliente' : 'Criar Novo Cliente' }}</h2>
      <form @submit.prevent="submitClientForm">
        <label for="nome">Nome:</label>
        <input type="text" v-model="clientForm.nome" required />

        <div class="form-buttons">
          <button type="submit">{{ isEditingClient ? 'Salvar' : 'Criar' }}</button>
          <button type="button" @click="cancelClientForm">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- Formulário de Atividade -->
    <div v-if="showActivityForm" class="form-container">
      <h2>{{ isEditingActivity ? 'Editar Atividade' : 'Criar Nova Atividade' }}</h2>
      <form @submit.prevent="submitActivityForm">
        <label for="nome">Nome:</label>
        <input type="text" v-model="activityForm.nome" required />

        <div class="form-buttons">
          <button type="submit">{{ isEditingActivity ? 'Salvar' : 'Criar' }}</button>
          <button type="button" @click="cancelActivityForm">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ClientsActivitiesComponent',
  data() {
    return {
      clients: [],
      activities: [],
      selectedClient: null,
      showClientForm: false,
      isEditingClient: false,
      clientForm: { id: null, nome: '' },
      showActivityForm: false,
      isEditingActivity: false,
      activityForm: { id: null, nome: '' }
    };
  },
  computed: {
    filteredActivities() {
      if (!this.selectedClient) {
        return this.activities;
      }
      return this.activities.filter(activity => activity.cliente_id === this.selectedClient.id);
    }
  },
  methods: {
    async fetchData() {
      const projectId = this.$route.params.id;
      try {
        const [clientsResponse, activitiesResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/projeto/${projectId}/cliente`),
          axios.get(`http://127.0.0.1:5000/projeto/${projectId}/atividade`)
        ]);
        this.clients = clientsResponse.data;
        this.activities = activitiesResponse.data;
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    },
    async fetchClientActivities(clientId) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/cliente/${clientId}/atividade`);
        this.activities = response.data;
      } catch (error) {
        console.error('Erro ao buscar atividades do cliente:', error);
      }
    },
    getClientName(clientId) {
      const client = this.clients.find(client => client.id === clientId);
      return client ? client.nome : 'Desconhecido';
    },
    async selectClient(client) {
      this.selectedClient = client;
      await this.fetchClientActivities(client.id);
    },
    showCreateClientForm() {
      this.resetClientForm();
      this.showClientForm = true;
      this.isEditingClient = false;
    },
    async createClient() {
      const projectId = this.$route.params.id;
      try {
        await axios.post(`http://127.0.0.1:5000/api/cliente`, { ...this.clientForm, projeto_id: projectId });
        this.fetchData(); // Atualiza os dados após a criação
        this.showClientForm = false;
      } catch (error) {
        console.error('Erro ao criar cliente:', error);
      }
    },
    editClient(client) {
      this.clientForm = { ...client };
      this.showClientForm = true;
      this.isEditingClient = true;
    },
    async updateClient() {
      try {
        await axios.put(`http://127.0.0.1:5000/api/cliente/${this.clientForm.id}`, this.clientForm);
        this.fetchData(); // Atualiza os dados após a atualização
        this.showClientForm = false;
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
      }
    },
    async deleteClient(id) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/cliente/${id}`);
        this.fetchData(); // Atualiza os dados após a exclusão
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    },
    submitClientForm() {
      if (this.isEditingClient) {
        this.updateClient();
      } else {
        this.createClient();
      }
    },
    cancelClientForm() {
      this.showClientForm = false;
      this.clientForm = { id: null, nome: '' };
    },
    resetClientForm() {
      this.clientForm = { id: null, nome: '' };
    },
    showCreateActivityForm() {
      this.resetActivityForm();
      this.showActivityForm = true;
      this.isEditingActivity = false;
    },
    async createActivity() {
      const projectId = this.$route.params.id;
      try {
        await axios.post(`http://127.0.0.1:5000/api/atividade`, { ...this.activityForm, projeto_id: projectId, cliente_id: this.selectedClient.id });
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a criação
        this.showActivityForm = false;
      } catch (error) {
        console.error('Erro ao criar atividade:', error);
      }
    },
    editActivity(activity) {
      this.activityForm = { ...activity };
      this.showActivityForm = true;
      this.isEditingActivity = true;
    },
    async updateActivity() {
      try {
        await axios.put(`http://127.0.0.1:5000/api/atividade/${this.activityForm.id}`, this.activityForm);
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a atualização
        this.showActivityForm = false;
      } catch (error) {
        console.error('Erro ao atualizar atividade:', error);
      }
    },
    async deleteActivity(id) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/atividade/${id}`);
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a exclusão
      } catch (error) {
        console.error('Erro ao excluir atividade:', error);
      }
    },
    submitActivityForm() {
      if (this.isEditingActivity) {
        this.updateActivity();
      } else {
        this.createActivity();
      }
    },
    cancelActivityForm() {
      this.showActivityForm = false;
      this.activityForm = { id: null, nome: '' };
    },
    resetActivityForm() {
      this.activityForm = { id: null, nome: '' };
    }
  },
  mounted() {
    this.fetchData();
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header-bar {
  background-color: #0078d4; /* Azul da Microsoft */
  color: white;
  padding: 10px 20px;
}

.header-bar h1 {
  margin: 0;
  font-size: 1.5em;
}

.content {
  display: flex;
  flex: 1;
  padding: 20px;
}

.column {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.bordered {
  border: 1px solid #e1dfdd;
  border-radius: 4px;
  padding: 10px;
  height: calc(100vh - 100px); /* Ajusta a altura para preencher a página */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  background-color: #f3f2f1;
  border: 1px solid #e1dfdd;
  border-radius: 4px;
  padding: 20px;
  width: calc(33.333% - 20px); /* Três cards por linha com espaçamento */
  box-sizing: border-box;
  cursor: pointer;
}

.card h3 {
  margin-top: 0;
}

.card button {
  background-color: #0078d4; /* Azul da Microsoft */
  color: white;
  border: none;
  padding: 10px; /* Reduzido o tamanho dos botões */
  font-size: 1em;
  cursor: pointer;
  border-radius: 0; /* Tornar os botões quadrados */
  margin: 10px; /* Aumentar as margens dos botões */
}

.card button:hover {
  background-color: #005a9e; /* Azul mais escuro ao passar o mouse */
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

.form-container input {
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