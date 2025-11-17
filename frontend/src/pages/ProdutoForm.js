import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { produtoAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';

const ProdutoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    descricao: '',
    generateDescription: false,
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduto();
    }
  }, [id]);

  const fetchProduto = async () => {
    try {
      setLoading(true);
      const response = await produtoAPI.get(id);
      const produto = response.data;
      setFormData({
        nome: produto.nome || '',
        preco: produto.preco || '',
        descricao: produto.descricao || '',
        generateDescription: false,
      });
    } catch (error) {
      toast.error('Erro ao carregar produto');
      navigate('/produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.preco) {
      toast.error('Nome e preço são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await produtoAPI.update(id, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await produtoAPI.create(formData);
        toast.success('Produto criado com sucesso!');
      }
      navigate('/produtos');
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
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
          <h2 className="mb-0">{isEdit ? 'Editar' : 'Novo'} Produto</h2>
        </Col>
      </Row>

      <Row>
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Preço *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  />
                </Form.Group>

                {!isEdit && (
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Gerar descrição automaticamente com IA"
                      checked={formData.generateDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, generateDescription: e.target.checked })
                      }
                    />
                  </Form.Group>
                )}

                <div className="d-flex gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : isEdit ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/produtos')}>
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProdutoForm;

