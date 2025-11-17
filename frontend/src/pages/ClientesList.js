import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { clienteAPI } from '../services/api';
import toast from 'react-hot-toast';

const ClientesList = () => {
  const [allClientes, setAllClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Carregar todos os clientes uma vez
  useEffect(() => {
    const fetchAllClientes = async () => {
      try {
        setLoading(true);
        // Carregar todos os clientes sem paginação
        const params = {
          page: 1,
          limit: 10000 // Limite alto para pegar todos
        };
        
        const response = await clienteAPI.getClientes(params);
        setAllClientes(response.data.data || []);
      } catch (error) {
        toast.error('Erro ao carregar clientes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllClientes();
  }, []);

  // Filtrar localmente quando os filtros mudarem
  useEffect(() => {
    let filtered = [...allClientes];

    // Filtrar por busca (código, razão social, CNPJ)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cliente => {
        const codigo = (cliente.codigo || '').toLowerCase();
        const razao = (cliente.razao || cliente.nome || '').toLowerCase();
        const cnpj = (cliente.cnpj || '').toLowerCase();
        return codigo.includes(searchLower) || 
               razao.includes(searchLower) || 
               cnpj.includes(searchLower);
      });
    }

    // Filtrar por tipo
    if (tipoFilter) {
      filtered = filtered.filter(cliente => cliente.tipo === tipoFilter);
    }

    // Filtrar por estado
    if (estadoFilter) {
      filtered = filtered.filter(cliente => cliente.estado === estadoFilter);
    }

    setFilteredClientes(filtered);
    setTotalElements(filtered.length);
    setCurrentPage(0); // Resetar página quando filtrar
  }, [allClientes, searchTerm, tipoFilter, estadoFilter]);

  // Aplicar paginação local quando os clientes filtrados mudarem
  useEffect(() => {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const paginated = filteredClientes.slice(start, end);
    setClientes(paginated);
    setTotalPages(Math.ceil(filteredClientes.length / pageSize));
  }, [filteredClientes, currentPage, pageSize]);

  const handleDelete = async (id, codigo) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${codigo}?`)) {
      try {
        await clienteAPI.deleteCliente(id);
        toast.success('Cliente excluído com sucesso!');
        fetchAllClientes();
      } catch (error) {
        // Error handling is done by the interceptor
      }
    }
  };

  const handleExport = () => {
    try {
      // Usar os clientes já filtrados localmente
      const clientesToExport = filteredClientes.length > 0 ? filteredClientes : allClientes;
      
      if (clientesToExport.length === 0) {
        toast.error('Nenhum cliente para exportar');
        return;
      }

      // Função para escapar campos CSV
      const escapeCSV = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Função para formatar telefone
      const formatTelefone = (cliente) => {
        if (cliente.telefoneCompleto) return cliente.telefoneCompleto;
        if (cliente.ddd && cliente.telefone) {
          return `(${cliente.ddd}) ${cliente.telefone}`;
        }
        if (cliente.telefone) return cliente.telefone;
        return '';
      };

      // Create CSV content
      const csvContent = [
        ['Código', 'Razão Social', 'Nome Fantasia', 'Tipo', 'CNPJ', 'Cidade', 'Estado', 'Email', 'Telefone'].join(','),
        ...clientesToExport.map(cliente => [
          escapeCSV(cliente.codigo),
          escapeCSV(cliente.razao || cliente.nome),
          escapeCSV(cliente.nomefantasia || ''),
          escapeCSV(cliente.tipo === 'J' ? 'Jurídica' : 'Física'),
          escapeCSV(cliente.cnpj),
          escapeCSV(cliente.cidade),
          escapeCSV(cliente.estado),
          escapeCSV(cliente.email),
          escapeCSV(formatTelefone(cliente))
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Relatório exportado com sucesso! ${clientesToExport.length} cliente(s)`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'J' ? (
      <span className="badge-primary">Jurídica</span>
    ) : (
      <span className="badge-secondary">Física</span>
    );
  };

  const getStatusBadge = (deleted) => {
    return deleted ? (
      <span className="badge-danger">Inativo</span>
    ) : (
      <span className="badge-success">Ativo</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Clientes
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os clientes cadastrados no sistema
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
          <button
            onClick={handleExport}
            className="btn-secondary btn-md"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <Link
            to="/clientes/novo"
            className="btn-primary btn-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card pt-6">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="label">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                  placeholder="Código, razão social, CNPJ..."
                />
              </div>
            </div>
            
            <div>
              <label className="label">Tipo</label>
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="J">Jurídica</option>
                <option value="F">Física</option>
              </select>
            </div>
            
            <div>
              <label className="label">Estado</label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="PR">Paraná</option>
                <option value="RS">Rio Grande do Sul</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTipoFilter('');
                  setEstadoFilter('');
                  setCurrentPage(0);
                }}
                className="btn-secondary btn-md w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Mostrando {clientes?.length} de {totalElements} clientes
          {totalElements !== allClientes.length && ` (${allClientes.length} total)`}
        </p>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Página {currentPage + 1} de {totalPages || 1}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : clientes?.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || tipoFilter || estadoFilter
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando um novo cliente.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/clientes/novo"
                  className="btn-primary btn-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clientes?.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {cliente.codigo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cliente.nome || cliente.razao}
                            </div>
                            {cliente.nomefantasia && (
                              <div className="text-xs text-gray-400">
                                {cliente.nomefantasia}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTipoBadge(cliente.tipo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <div>{cliente.cidade || '-'}</div>
                            <div className="text-gray-500">{cliente.estado || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {cliente.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="truncate max-w-32">{cliente.email}</span>
                            </div>
                          )}
                          {cliente.telefoneCompleto && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-3 w-3 text-gray-400 mr-1" />
                              <span>{cliente.telefoneCompleto}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(cliente.deleted)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(cliente.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/clientes/${cliente.id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/clientes/${cliente.id}/editar`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(cliente.id, cliente.codigo)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && filteredClientes.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="btn-secondary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="btn-secondary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage + 1}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesList;
