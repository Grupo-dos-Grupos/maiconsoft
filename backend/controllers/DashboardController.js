const Cliente = require("../models/Cliente");
const Produto = require("../models/Produto");
const Pedido = require("../models/Pedido");

class DashboardController {
  static async getDashboard(req, res, next) {
    try {
      const [
        totalClientes,
        totalProdutos,
        totalPedidos,
        pedidosMes,
        totalVendas,
        clientesAtivos,
        clientesInativos,
        clientesMesAtual,
        pedidosPorStatus,
        vendasPorMes,
        clientesPorEstado,
        clientesPorTipo,
        topCidades,
      ] = await Promise.all([
        Cliente.countAtivos(),
        Produto.countAtivos(),
        Pedido.countAtivos(),
        Pedido.countMesAtual(),
        Pedido.getTotalVendas(),
        Cliente.countAtivos(),
        Cliente.countInativos(),
        Cliente.countMesAtual(),
        Pedido.getPorStatus(),
        Pedido.getVendasPorMes(6),
        Cliente.getPorEstado(),
        Cliente.getPorTipo(),
        Cliente.getTopCidades(5),
      ]);

      res.json({
        totalClientes,
        totalProdutos,
        totalPedidos,
        pedidosMes,
        totalVendas,
        clientesAtivos,
        clientesInativos,
        clientesMesAtual,
        pedidosPorStatus,
        vendasPorMes,
        clientesPorEstado,
        clientesPorTipo,
        topCidades,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
