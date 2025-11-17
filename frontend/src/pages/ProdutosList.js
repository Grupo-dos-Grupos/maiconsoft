import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { produtoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Table, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';

const ProdutosList = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState(null);

  useEffect(() => {
    fetchProdutos();
  }, [searchTerm]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      const response = await produtoAPI.list({ search: searchTerm });
      setProdutos(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (produto) => {
    setSelectedProduto(produto);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await produtoAPI.delete(selectedProduto.id);
      toast.success('Produto excluído com sucesso!');
      setShowDeleteModal(false);
      setSelectedProduto(null);
      fetchProdutos();
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 200px)',
      minHeight: '600px'
    }}>
      <Container fluid className="py-4 d-flex flex-column" style={{ flex: 1, overflow: 'hidden' }}>
        <Row className="mb-4 flex-shrink-0">
          <Col>
            <h2 className="mb-0">Produtos</h2>
            <p className="text-muted">Gerencie todos os produtos cadastrados</p>
          </Col>
          <Col xs="auto">
            <Link to="/produtos/novo" className="btn btn-primary">
              <Plus className="me-2" size={18} />
              Novo Produto
            </Link>
          </Col>
        </Row>

        <Card className="d-flex flex-column" style={{ flex: 1, overflow: 'hidden' }}>
          <Card.Body className="d-flex flex-column" style={{ flex: 1, overflow: 'hidden', padding: '1.5rem' }}>
            <Row className="mb-3 flex-shrink-0">
              <Col md={4}>
                <Form.Group className="position-relative">
                  <Form.Control
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                  />
                  <Search
                    className="position-absolute"
                    style={{ left: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    size={18}
                  />
                </Form.Group>
              </Col>
            </Row>

            {loading ? (
              <div className="text-center py-5 flex-grow-1 d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-5 flex-grow-1 d-flex flex-column align-items-center justify-content-center">
                <Package size={48} className="text-muted mb-3" />
                <h5>Nenhum produto encontrado</h5>
                <p className="text-muted">Comece criando um novo produto</p>
                <Link to="/produtos/novo" className="btn btn-primary">
                  <Plus className="me-2" size={18} />
                  Novo Produto
                </Link>
              </div>
            ) : (
              <div className="table-responsive flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                <Table hover style={{ tableLayout: 'fixed', width: '100%', marginBottom: 0 }}>
                  <colgroup>
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '45%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead className="sticky-top bg-white" style={{ zIndex: 10 }}>
                    <tr>
                      <th>Nome</th>
                      <th>Preço</th>
                      <th>Descrição</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id} style={{ height: '80px' }}>
                        <td style={{ 
                          verticalAlign: 'middle',
                          height: '80px'
                        }}>
                          <div style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {produto.nome}
                          </div>
                        </td>
                        <td style={{ 
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          height: '80px'
                        }}>
                          {formatPrice(produto.preco)}
                        </td>
                        <td style={{ 
                          verticalAlign: 'middle',
                          height: '80px'
                        }}>
                          <div style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            wordBreak: 'break-word',
                            lineHeight: '1.4',
                            maxHeight: '2.8em',
                            minHeight: '2.8em'
                          }}>
                            {produto.descricao || <span className="text-muted fst-italic">Sem descrição</span>}
                          </div>
                        </td>
                        <td className="text-end" style={{ 
                          whiteSpace: 'nowrap',
                          verticalAlign: 'middle',
                          height: '80px'
                        }}>
                          <Link
                            to={`/produtos/${produto.id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/produtos/${produto.id}/editar`}
                            className="btn btn-sm btn-outline-secondary me-2"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Link>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(produto)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o produto <strong>{selectedProduto?.nome}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProdutosList;

