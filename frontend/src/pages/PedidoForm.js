import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pedidoAPI, clienteAPI, produtoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Form, Button, Spinner, Table } from 'react-bootstrap';

const PedidoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: '',
    status: 'pendente',
    produtos: [],
  });
  const [selectedProduto, setSelectedProduto] = useState({ produtoId: '', quantidade: 1 });
  const [pedidoOriginalStatus, setPedidoOriginalStatus] = useState(null);
  // Pedido está concluído se: já estava concluído no banco OU status atual do formulário é concluído
  const isConcluido = (isEdit && pedidoOriginalStatus === 'concluido') || formData.status === 'concluido';

  useEffect(() => {
    fetchClientes();
    fetchProdutos();
    if (isEdit) {
      fetchPedido();
    }
  }, [id]);

  const fetchClientes = async () => {
    try {
      const response = await clienteAPI.getClientes();
      setClientes(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await produtoAPI.list();
      setProdutos(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    }
  };

  const fetchPedido = async () => {
    try {
      setLoading(true);
      const response = await pedidoAPI.get(id);
      const pedido = response.data;
      setPedidoOriginalStatus(pedido.status);
      setFormData({
        clienteId: pedido.cliente_id.toString(),
        status: pedido.status,
        produtos: pedido.produtos?.map((p) => ({
          produtoId: p.produto_id.toString(),
          quantidade: p.quantidade.toString(),
        })) || [],
      });
    } catch (error) {
      toast.error('Erro ao carregar pedido');
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  };

  const addProduto = () => {
    if (isEdit && pedidoOriginalStatus === 'concluido') {
      toast.error('Não é possível adicionar produtos em um pedido concluído');
      return;
    }

    if (!selectedProduto.produtoId || !selectedProduto.quantidade || selectedProduto.quantidade <= 0) {
      toast.error('Selecione um produto e informe a quantidade');
      return;
    }

    const produtoExists = formData.produtos.find(
      (p) => p.produtoId === selectedProduto.produtoId
    );

    if (produtoExists) {
      toast.error('Produto já adicionado ao pedido');
      return;
    }

    setFormData({
      ...formData,
      produtos: [...formData.produtos, { ...selectedProduto }],
    });
    setSelectedProduto({ produtoId: '', quantidade: 1 });
  };

  const removeProduto = (index) => {
    if (isEdit && pedidoOriginalStatus === 'concluido') {
      toast.error('Não é possível remover produtos de um pedido concluído');
      return;
    }

    setFormData({
      ...formData,
      produtos: formData.produtos.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Bloquear submit se o pedido estiver concluído
    if (isEdit && pedidoOriginalStatus === 'concluido') {
      toast.error('Não é possível editar um pedido concluído');
      return;
    }

    if (!formData.clienteId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (formData.produtos.length === 0) {
      toast.error('Adicione pelo menos um produto');
      return;
    }

    try {
      setLoading(true);
      const data = {
        clienteId: parseInt(formData.clienteId),
        status: formData.status,
        produtos: formData.produtos.map((p) => ({
          produtoId: parseInt(p.produtoId),
          quantidade: parseInt(p.quantidade),
        })),
      };

      if (isEdit) {
        await pedidoAPI.update(id, data);
        toast.success('Pedido atualizado com sucesso!');
      } else {
        await pedidoAPI.create(data);
        toast.success('Pedido criado com sucesso!');
      }
      navigate('/pedidos');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao salvar pedido';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProdutoNome = (produtoId) => {
    const produto = produtos.find((p) => p.id.toString() === produtoId);
    return produto?.nome || 'Produto não encontrado';
  };

  const getProdutoPreco = (produtoId) => {
    const produto = produtos.find((p) => p.id.toString() === produtoId);
    const preco = produto?.preco || 0;
    return typeof preco === 'string' ? parseFloat(preco) : Number(preco) || 0;
  };

  const calculateTotal = () => {
    return formData.produtos.reduce((total, item) => {
      return total + getProdutoPreco(item.produtoId) * parseInt(item.quantidade);
    }, 0);
  };

  if (loading && isEdit) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-0">
            {isEdit && pedidoOriginalStatus === 'concluido' 
              ? 'Visualizar Pedido (Concluído)' 
              : isEdit 
                ? 'Editar Pedido' 
                : 'Novo Pedido'}
          </h2>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                {isEdit && pedidoOriginalStatus === 'concluido' && (
                  <div className="alert alert-danger mb-3">
                    <strong>Atenção:</strong> Este pedido está concluído e não pode ser editado.
                  </div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    required
                    disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome || cliente.razao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="processando">Processando</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </Form.Select>
                </Form.Group>

                <hr />

                <h5 className="mb-3">Produtos</h5>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Select
                      value={selectedProduto.produtoId}
                      onChange={(e) =>
                        setSelectedProduto({ ...selectedProduto, produtoId: e.target.value })
                      }
                      disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} - R$ {parseFloat(produto.preco).toFixed(2)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="number"
                      min="1"
                      value={selectedProduto.quantidade}
                      onChange={(e) =>
                        setSelectedProduto({ ...selectedProduto, quantidade: e.target.value })
                      }
                      placeholder="Quantidade"
                      disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                    />
                  </Col>
                  <Col md={2}>
                    <Button 
                      variant="primary" 
                      onClick={addProduto} 
                      className="w-100"
                      disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                    >
                      Adicionar
                    </Button>
                  </Col>
                </Row>

                {formData.produtos.length > 0 && (
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.produtos.map((item, index) => (
                        <tr key={index}>
                          <td>{getProdutoNome(item.produtoId)}</td>
                          <td>{item.quantidade}</td>
                          <td>R$ {getProdutoPreco(item.produtoId).toFixed(2)}</td>
                          <td>
                            R${' '}
                            {(
                              getProdutoPreco(item.produtoId) * parseInt(item.quantidade)
                            ).toFixed(2)}
                          </td>
                          <td>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeProduto(index)}
                              disabled={isEdit && pedidoOriginalStatus === 'concluido'}
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading || (isEdit && pedidoOriginalStatus === 'concluido')}
              >
                {loading ? <Spinner size="sm" /> : isEdit ? 'Atualizar' : 'Criar'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/pedidos')}>
                {isEdit && pedidoOriginalStatus === 'concluido' ? 'Voltar' : 'Cancelar'}
              </Button>
            </div>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Resumo do Pedido</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Total de itens:</strong> {formData.produtos.length}
                </p>
                <p>
                  <strong>Total:</strong>{' '}
                  <span className="fs-4 text-primary">
                    R$ {calculateTotal().toFixed(2)}
                  </span>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default PedidoForm;

