const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../services/authentication');

// Route to fetch dashboard stats and graphs
router.get('/getDetails', auth.authenticateToken, dashboardController.getDashboardDetails);

module.exports = router;