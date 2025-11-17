const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

router.get('/', ProdutoController.list);
router.get('/:id', ProdutoController.show);
router.post('/', ProdutoController.create);
router.put('/:id', ProdutoController.update);
router.delete('/:id', ProdutoController.delete);

module.exports = router;

