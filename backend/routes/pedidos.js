const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');

router.get('/', PedidoController.list);
router.get('/:id', PedidoController.show);
router.post('/', PedidoController.create);
router.put('/:id', PedidoController.update);
router.delete('/:id', PedidoController.delete);

module.exports = router;

