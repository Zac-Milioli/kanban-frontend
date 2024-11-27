import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000', // Certifique-se de que esta URL está correta
  timeout: 10000, // Tempo limite para a requisição
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;