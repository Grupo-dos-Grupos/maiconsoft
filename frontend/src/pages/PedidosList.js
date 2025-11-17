import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pedidoAPI, clienteAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Badge, Nav, Tab } from 'react-bootstrap';
import { Plus, ShoppingCart } from 'lucide-react';

const PedidosList = () => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosConcluidos, setPedidosConcluidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingConcluidos, setLoadingConcluidos] = useState(false);
  const [clienteFilter, setClienteFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('ativos');

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (activeTab === 'ativos') {
      fetchPedidos();
    } else {
      fetchPedidosConcluidos();
    }
  }, [clienteFilter, statusFilter, activeTab]);

  const fetchClientes = async () => {
    try {
      const response = await clienteAPI.getClientes();
      setClientes(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes');
    }
  };

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const params = { excludeConcluidos: true };
      if (clienteFilter) params.clienteId = clienteFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await pedidoAPI.list(params);
      setPedidos(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPedidosConcluidos = async () => {
    try {
      setLoadingConcluidos(true);
      const params = { status: 'concluido', excludeConcluidos: false };
      if (clienteFilter) params.clienteId = clienteFilter;
      
      const response = await pedidoAPI.list(params);
      setPedidosConcluidos(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar pedidos concluídos');
    } finally {
      setLoadingConcluidos(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pendente: 'warning',
      processando: 'info',
      concluido: 'success',
      cancelado: 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const renderPedidosTable = (pedidosList, isLoading) => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (pedidosList.length === 0) {
      return (
        <div className="text-center py-5">
          <ShoppingCart size={48} className="text-muted mb-3" />
          <h5>Nenhum pedido encontrado</h5>
          <p className="text-muted">
            {activeTab === 'ativos' 
              ? 'Comece criando um novo pedido' 
              : 'Não há pedidos concluídos'}
          </p>
          {activeTab === 'ativos' && (
            <Link to="/pedidos/novo" className="btn btn-primary">
              <Plus className="me-2" size={18} />
              Novo Pedido
            </Link>
          )}
        </div>
      );
    }

    return (
      <Table responsive hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Status</th>
            <th>Total</th>
            <th>Produtos</th>
            <th className="text-end">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosList.map((pedido) => (
            <tr key={pedido.id}>
              <td>#{pedido.id}</td>
              <td>{pedido.cliente_nome}</td>
              <td>{formatDate(pedido.data)}</td>
              <td>{getStatusBadge(pedido.status)}</td>
              <td>{formatPrice(pedido.total)}</td>
              <td>{pedido.produtos?.length || 0} item(s)</td>
              <td className="text-end">
                <Link
                  to={`/pedidos/${pedido.id}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  Ver Detalhes
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">Pedidos</h2>
          <p className="text-muted">Gerencie todos os pedidos</p>
        </Col>
        <Col xs="auto">
          <Link to="/pedidos/novo" className="btn btn-primary">
            <Plus className="me-2" size={18} />
            Novo Pedido
          </Link>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => {
            setActiveTab(k || 'ativos');
            if (k === 'concluidos') {
              setStatusFilter(''); // Resetar filtro de status ao mudar para concluídos
            }
          }}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="ativos">Pedidos Ativos</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="concluidos">Pedidos Concluídos</Nav.Link>
              </Nav.Item>
            </Nav>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Cliente</Form.Label>
                  <Form.Select
                    value={clienteFilter}
                    onChange={(e) => setClienteFilter(e.target.value)}
                  >
                    <option value="">Todos os clientes</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome || cliente.razao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              {activeTab === 'ativos' && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Todos os status</option>
                      <option value="pendente">Pendente</option>
                      <option value="processando">Processando</option>
                      <option value="cancelado">Cancelado</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>

            <Tab.Content>
              <Tab.Pane eventKey="ativos">
                {renderPedidosTable(pedidos, loading)}
              </Tab.Pane>
              <Tab.Pane eventKey="concluidos">
                {renderPedidosTable(pedidosConcluidos, loadingConcluidos)}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PedidosList;

