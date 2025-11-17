import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ClientesList from './pages/ClientesList';
import ClienteForm from './pages/ClienteForm';
import ClienteDetail from './pages/ClienteDetail';
import ProdutosList from './pages/ProdutosList';
import ProdutoForm from './pages/ProdutoForm';
import ProdutoDetail from './pages/ProdutoDetail';
import PedidosList from './pages/PedidosList';
import PedidoForm from './pages/PedidoForm';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<ClientesList />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/:id" element={<ClienteDetail />} />
            <Route path="/clientes/:id/editar" element={<ClienteForm />} />
            <Route path="/produtos" element={<ProdutosList />} />
            <Route path="/produtos/novo" element={<ProdutoForm />} />
            <Route path="/produtos/:id" element={<ProdutoDetail />} />
            <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
            <Route path="/pedidos" element={<PedidosList />} />
            <Route path="/pedidos/novo" element={<PedidoForm />} />
            <Route path="/pedidos/:id" element={<PedidoForm />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
