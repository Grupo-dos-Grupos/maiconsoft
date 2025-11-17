import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  DollarSign,
  FileText,
  Loader2,
  XCircle,
  Calendar
} from 'lucide-react';
import { produtoAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProdutoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduto();
  }, [id]);

  const fetchProduto = async () => {
    try {
      setLoading(true);
      const response = await produtoAPI.get(id);
      setProduto(response.data);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      navigate('/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
      try {
        await produtoAPI.delete(id);
        toast.success('Produto excluído com sucesso!');
        navigate('/produtos');
      } catch (error) {
        // Error handling is done by the interceptor
      }
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatusBadge = (deleted) => {
    if (deleted === true || deleted === 'true') {
      return <span className="badge-danger">Inativo</span>;
    }
    return <span className="badge-success">Ativo</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="text-center py-16">
        <XCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Produto não encontrado</h3>
        <p className="mt-2 text-sm text-gray-500">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <div className="mt-6">
          <Link
            to="/produtos"
            className="btn-primary btn-md"
          >
            Voltar para Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/produtos')}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {produto.nome}
            </h1>
            <div className="mt-2 flex items-center space-x-4">
              {getStatusBadge(produto.deleted || false)}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/produtos/${id}/editar`}
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
              <h3 className="text-lg font-medium text-gray-900">Informações do Produto</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Package className="h-4 w-4 mr-2" />
                    Nome
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">{produto.nome}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Preço
                  </dt>
                  <dd className="text-2xl font-bold text-primary-600">
                    {formatPrice(produto.preco)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-2">Status</dt>
                  <dd>
                    {getStatusBadge(produto.deleted || false)}
                  </dd>
                </div>
                {produto.descricao && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                      <FileText className="h-4 w-4 mr-2" />
                      Descrição
                    </dt>
                    <dd className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {produto.descricao}
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
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  {getStatusBadge(produto.deleted || false)}
                </div>
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
                  <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    Criado em
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDateTime(produto.created_at)}
                  </dd>
                </div>
                {produto.updated_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-2">Última atualização</dt>
                    <dd className="text-sm text-gray-900">
                      {formatDateTime(produto.updated_at)}
                    </dd>
                  </div>
                )}
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
                  to={`/produtos/${id}/editar`}
                  className="w-full btn-primary btn-md flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Produto
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full btn-danger btn-md flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Produto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetail;
