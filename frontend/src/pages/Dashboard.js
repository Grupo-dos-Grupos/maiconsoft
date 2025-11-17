import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  UserCheck, 
  UserX, 
  TrendingUp,
  MapPin,
  Calendar,
  Plus,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/clientes/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total de Clientes',
      value: dashboardData?.totalClientes || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Clientes Ativos',
      value: dashboardData?.clientesAtivos || 0,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Clientes Inativos',
      value: dashboardData?.clientesInativos || 0,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: '-2%',
      changeType: 'negative'
    },
    {
      name: 'Cadastros Este Mês',
      value: dashboardData?.clientesMesAtual || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+25%',
      changeType: 'positive'
    }
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard - MaicoSoft
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Visão geral do sistema de gestão de clientes
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <Link
            to="/clientes/novo"
            className="btn-primary btn-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes por Estado */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Clientes por Estado</h3>
            <p className="text-sm text-gray-500">Distribuição geográfica dos clientes</p>
          </div>
          <div className="card-content">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData?.clientesPorEstado || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="estado" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Clientes por Tipo */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Clientes por Tipo</h3>
            <p className="text-sm text-gray-500">Pessoas Jurídicas vs Físicas</p>
          </div>
          <div className="card-content">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={dashboardData?.clientesPorTipo || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tipo, percent }) => `${tipo}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="tipo"
                  >
                    {(dashboardData?.clientesPorTipo || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Top Cidades */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Top 5 Cidades</h3>
          <p className="text-sm text-gray-500">Cidades com maior número de clientes</p>
        </div>
        <div className="card-content">
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {(dashboardData?.topCidades || []).slice(0, 5).map((cidade, index) => (
                <li key={cidade.cidade} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cidade.cidade}
                      </p>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {cidade.total} clientes
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
