const express = require('express');
const PaymentController = require('../controllers/PaymentController');

const router = express.Router();

router.post('/intent', PaymentController.createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.webhook);

module.exports = router;
