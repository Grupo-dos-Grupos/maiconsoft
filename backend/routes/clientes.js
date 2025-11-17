const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const DashboardController = require('../controllers/DashboardController');

router.get('/', ClienteController.list);
router.get('/dashboard', DashboardController.getDashboard);
router.get('/:id', ClienteController.show);
router.post('/', ClienteController.create);
router.put('/:id', ClienteController.update);
router.delete('/:id', ClienteController.delete);
router.post('/:id/restore', ClienteController.restore);

module.exports = router;

