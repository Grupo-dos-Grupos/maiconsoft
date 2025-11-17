import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Dados inválidos');
          break;
        case 401:
          toast.error('Não autorizado');
          localStorage.removeItem('token');
          break;
        case 403:
          toast.error('Acesso negado');
          break;
        case 404:
          toast.error('Recurso não encontrado');
          break;
        case 422:
          if (data.errors) {
            Object.values(data.errors).forEach(error => {
              toast.error(error);
            });
          } else {
            toast.error(data.message || 'Erro de validação');
          }
          break;
        case 500:
          toast.error('Erro interno do servidor');
          break;
        default:
          toast.error(data.message || 'Erro inesperado');
      }
    } else if (error.request) {
      toast.error('Erro de conexão com o servidor');
    } else {
      toast.error('Erro inesperado');
    }
    
    return Promise.reject(error);
  }
);

// Cliente API methods
export const clienteAPI = {
  // Listar clientes com filtros e paginação
  getClientes: (params = {}) => {
    return api.get('/clientes', { params });
  },

  // Buscar cliente por ID
  getCliente: (id) => {
    return api.get(`/clientes/${id}`);
  },

  // Buscar cliente por código
  getClienteByCodigo: (codigo) => {
    return api.get(`/clientes/codigo/${codigo}`);
  },

  // Buscar cliente por CNPJ
  getClienteByCnpj: (cnpj) => {
    return api.get(`/clientes/cnpj/${cnpj}`);
  },

  // Criar novo cliente
  createCliente: (data) => {
    return api.post('/clientes', data);
  },

  // Atualizar cliente
  updateCliente: (id, data) => {
    return api.put(`/clientes/${id}`, data);
  },

  // Excluir cliente (soft delete)
  deleteCliente: (id) => {
    return api.delete(`/clientes/${id}`);
  },

  // Restaurar cliente
  restoreCliente: (id) => {
    return api.post(`/clientes/${id}/restore`);
  },

  // Dashboard
  getDashboard: () => {
    return api.get('/dashboard');
  },

  // Validação CNPJ
  validarCnpj: (cnpj) => {
    return api.get(`/validar-cnpj/${cnpj}`);
  },

  // Buscar CEP
  buscarCep: (cep) => {
    return api.get(`/buscar-cep/${cep}`);
  }
};

// Produto API methods
export const produtoAPI = {
  list: (params = {}) => api.get('/produtos', { params }),
  get: (id) => api.get(`/produtos/${id}`),
  create: (data) => api.post('/produtos', data),
  update: (id, data) => api.put(`/produtos/${id}`, data),
  delete: (id) => api.delete(`/produtos/${id}`),
};

// Pedido API methods
export const pedidoAPI = {
  list: (params = {}) => api.get('/pedidos', { params }),
  get: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
  update: (id, data) => api.put(`/pedidos/${id}`, data),
  delete: (id) => api.delete(`/pedidos/${id}`),
};

export default api;
