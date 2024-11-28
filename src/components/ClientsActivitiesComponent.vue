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
            <h3>{{ client.name }}</h3>
            <button @click.stop="editClient(client)">Editar</button>
            <button @click.stop="deleteClient(client.id)">Excluir</button>
          </div>
        </div>
      </div>
      <div class="column bordered">
        <div class="section-header">
          <h2>{{ selectedClient ? `Atividades de ${selectedClient.name}` : 'Todas as atividades do projeto' }}</h2>
          <div>
            <button v-if="selectedClient" @click="showCreateActivityForm">Adicionar Atividade</button>
            <button v-if="selectedClient" @click="deselectClient">Voltar</button>
          </div>
        </div>
        <div v-for="status in activityStatuses" :key="status" class="status-section">
          <h2>{{ status }}</h2>
          <div class="cards-container">
            <div v-for="activity in filteredActivitiesByStatus(status)" :key="activity.id" class="card">
              <h3>{{ activity.name }}</h3>
              <p v-if="selectedClient === null">Cliente: {{ getClientName(activity.client_id) }}</p>
              <div class="card-buttons">
                <button @click="editActivity(activity)">Editar</button>
                <button @click="deleteActivity(activity.id)">Excluir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário de Cliente -->
    <div v-if="showClientForm" class="form-container">
      <h2>{{ isEditingClient ? 'Editar Cliente' : 'Criar Novo Cliente' }}</h2>
      <form @submit.prevent="submitClientForm">
        <label for="name">Nome:</label>
        <input type="text" v-model="clientForm.name" required />

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
        <label for="name">Nome:</label>
        <input type="text" v-model="activityForm.name" required />
        <label for="description">Descrição:</label>
        <input type="text" v-model="activityForm.description" />
        <label for="status">Status:</label>
        <select v-model="activityForm.status" required>
          <option v-for="status in activityStatuses" :key="status" :value="status">{{ status }}</option>
        </select>

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
      clientForm: { id: null, name: '', project_id: null },
      showActivityForm: false,
      isEditingActivity: false,
      activityForm: { id: null, name: '', description: '', status: '', client_id: null },
      activityStatuses: ['Em andamento', 'Concluído', 'Cancelado']
    };
  },
  computed: {
    filteredActivities() {
      if (!this.selectedClient) {
        return this.activities;
      }
      return this.activities.filter(activity => activity.client_id === this.selectedClient.id);
    }
  },
  methods: {
    filteredActivitiesByStatus(status) {
      return this.filteredActivities.filter(activity => activity.status === status);
    },
    async fetchData() {
      const projectId = this.$route.params.id;
      try {
        const [clientsResponse, activitiesResponse] = await Promise.all([
          axios.get(`http://localhost:8000/client?project_id=${projectId}`),
          axios.get(`http://localhost:8000/activity?project_id=${projectId}`)
        ]);
        this.clients = clientsResponse.data;
        this.activities = activitiesResponse.data;
      } catch (error) {
        alert('Erro ao buscar dados');
      }
    },
    async fetchClientActivities(clientId) {
      try {
        const response = await axios.get(`http://localhost:8000/activity?client_id=${clientId}`);
        this.activities = response.data;
      } catch (error) {
        alert('Erro ao buscar atividades do cliente');
      }
    },
    getClientName(clientId) {
      const client = this.clients.find(client => client.id === clientId);
      return client ? client.name : 'Desconhecido';
    },
    async selectClient(client) {
      this.selectedClient = client;
      await this.fetchClientActivities(client.id);
    },
    deselectClient() {
      this.selectedClient = null;
      this.fetchData();
    },
    showCreateClientForm() {
      this.resetClientForm();
      this.showClientForm = true;
      this.isEditingClient = false;
    },
    async createClient() {
      const projectId = this.$route.params.id;
      try {
        await axios.post(`http://localhost:8000/client`, { ...this.clientForm, project_id: projectId });
        this.fetchData(); // Atualiza os dados após a criação
        this.showClientForm = false;
      } catch (error) {
        alert('Erro ao criar cliente');
      }
    },
    editClient(client) {
      this.clientForm = { ...client };
      this.showClientForm = true;
      this.isEditingClient = true;
    },
    async updateClient() {
      try {
        await axios.put(`http://localhost:8000/client/${this.clientForm.id}`, this.clientForm);
        this.fetchData(); // Atualiza os dados após a atualização
        this.showClientForm = false;
      } catch (error) {
        alert('Erro ao atualizar cliente');
      }
    },
    async deleteClient(id) {
      try {
        await axios.delete(`http://localhost:8000/client/${id}`);
        this.fetchData(); // Atualiza os dados após a exclusão
      } catch (error) {
        alert('Erro ao excluir cliente');
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
      this.clientForm = { id: null, name: '', project_id: null };
    },
    resetClientForm() {
      this.clientForm = { id: null, name: '', project_id: null };
    },
    showCreateActivityForm() {
      this.resetActivityForm();
      this.showActivityForm = true;
      this.isEditingActivity = false;
    },
    async createActivity() {
      try {
        await axios.post(`http://localhost:8000/activity`, { ...this.activityForm, client_id: this.selectedClient.id });
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a criação
        this.showActivityForm = false;
      } catch (error) {
        alert('Erro ao criar atividade');
      }
    },
    editActivity(activity) {
      this.activityForm = { ...activity };
      this.showActivityForm = true;
      this.isEditingActivity = true;
    },
    async updateActivity() {
      try {
        await axios.put(`http://localhost:8000/activity/${this.activityForm.id}`, this.activityForm);
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a atualização
        this.showActivityForm = false;
      } catch (error) {
        alert('Erro ao atualizar atividade');
      }
    },
    async deleteActivity(id) {
      try {
        await axios.delete(`http://localhost:8000/activity/${id}`);
        this.fetchClientActivities(this.selectedClient.id); // Atualiza as atividades após a exclusão
      } catch (error) {
        alert('Erro ao excluir atividade');
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
      this.activityForm = { id: null, name: '', description: '', status: '', client_id: null };
    },
    resetActivityForm() {
      this.activityForm = { id: null, name: '', description: '', status: '', client_id: null };
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

.status-section {
  display: flex;
  flex-direction: column;
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
  width: 50%;
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
}

.section-header h2 {
  max-width: 250px;
  word-wrap: break-word;
}

.section-header button {
  margin: 10px;
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
  position: relative;
}

.card h3 {
  margin-top: 0;
  text-align: center;
  max-width: 80%;
  word-wrap: break-word;
}

.card button {
  background-color: #0078d4; /* Azul da Microsoft */
  color: white;
  border: none;
  padding: 10px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 2px;
  margin: 5px; /* Aumentar a margem entre os botões e o texto */
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
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
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
  margin-bottom: 20px; /* Aumentar a margem entre os inputs e selects */
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
  margin-right: 20px; /* Aumentar a margem entre os botões */
}

.form-buttons button:last-child {
  margin-right: 0;
}

.form-buttons button:hover {
  background-color: #005a9e;
}
</style>