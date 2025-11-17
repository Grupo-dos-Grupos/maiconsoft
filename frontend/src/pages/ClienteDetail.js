import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  FileText,
  Globe,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { clienteAPI } from '../services/api';
import toast from 'react-hot-toast';

const ClienteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCliente();
  }, [id]);

  const fetchCliente = async () => {
    try {
      setLoading(true);
      const response = await clienteAPI.getCliente(id);
      setCliente(response.data.cliente);
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${cliente.codigo}?`)) {
      try {
        await clienteAPI.deleteCliente(id);
        toast.success('Cliente excluído com sucesso!');
        navigate('/clientes');
      } catch (error) {
        // Error handling is done by the interceptor
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'J' ? (
      <span className="badge-primary">Pessoa Jurídica</span>
    ) : (
      <span className="badge-secondary">Pessoa Física</span>
    );
  };

  const getStatusBadge = (deleted) => {
    return deleted ? (
      <span className="badge-danger">Inativo</span>
    ) : (
      <span className="badge-success">Ativo</span>
    );
  };

  const getFinalidadeBadge = (finalidade) => {
    return finalidade === 'F' ? (
      <span className="badge-warning">Fiscal</span>
    ) : (
      <span className="badge-primary">Comercial</span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Cliente não encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          O cliente que você está procurando não existe ou foi removido.
        </p>
        <div className="mt-6">
          <Link
            to="/clientes"
            className="btn-primary btn-md"
          >
            Voltar para Clientes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/clientes')}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {cliente.codigo} - {cliente.razao}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              {getTipoBadge(cliente.tipo)}
              {getStatusBadge(cliente.deleted)}
              {cliente.finalidade && getFinalidadeBadge(cliente.finalidade)}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/clientes/${id}/editar`}
            className="btn-primary btn-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="btn-danger btn-md"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Informações Básicas</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Código</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.codigo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loja</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.loja}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Razão Social</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.nome || cliente.razao}</dd>
                </div>
                {cliente.nomefantasia && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Nome Fantasia</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.nomefantasia}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.tipo === 'J' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Finalidade</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {cliente.finalidade === 'F' ? 'Fiscal' : 'Comercial'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {cliente.cnpj && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CNPJ/CPF</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.cnpjFormatado}</dd>
                  </div>
                )}
                {cliente.abertura && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Data de Abertura</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(cliente.abertura)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">País</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.pais}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Endereço</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {cliente.cep && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CEP</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.cepFormatado}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.estado || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cidade</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cliente.cidade || '-'}</dd>
                </div>
                {cliente.codmunicipio && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Código do Município</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.codmunicipio}</dd>
                  </div>
                )}
                {cliente.endereco && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Endereço</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.endereco}</dd>
                  </div>
                )}
                {cliente.bairro && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bairro</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.bairro}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Contact */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Contato</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {cliente.telefoneCompleto && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.telefoneCompleto}</dd>
                  </div>
                )}
                {cliente.email && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${cliente.email}`} className="text-primary-600 hover:text-primary-500">
                        {cliente.email}
                      </a>
                    </dd>
                  </div>
                )}
                {cliente.contato && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contato</dt>
                    <dd className="mt-1 text-sm text-gray-900">{cliente.contato}</dd>
                  </div>
                )}
                {cliente.homepage && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Homepage</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a 
                        href={cliente.homepage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {cliente.homepage}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  {getStatusBadge(cliente.deleted)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Tipo</span>
                  {getTipoBadge(cliente.tipo)}
                </div>
                {cliente.finalidade && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Finalidade</span>
                    {getFinalidadeBadge(cliente.finalidade)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Auditoria</h3>
            </div>
            <div className="card-content">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Criado em</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDateTime(cliente.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Última atualização</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDateTime(cliente.updatedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                <Link
                  to={`/clientes/${id}/editar`}
                  className="w-full btn-primary btn-md"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Cliente
                </Link>
                {cliente.email && (
                  <a
                    href={`mailto:${cliente.email}`}
                    className="w-full btn-secondary btn-md"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </a>
                )}
                {cliente.telefoneCompleto && (
                  <a
                    href={`tel:${cliente.telefoneCompleto}`}
                    className="w-full btn-secondary btn-md"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </a>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full btn-danger btn-md"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDetail;
