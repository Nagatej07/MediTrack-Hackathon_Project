const express = require('express');
const router = express.Router();
const { createMealPlan, getUserMealPlans } = require('../controllers/mealPlanController');
const authMiddleware = require('../middleware/authMiddleware');



// Save a new meal plan
router.post('/create', authMiddleware, createMealPlan);

// Get all meal plans for the logged-in user
router.get('/', authMiddleware, getUserMealPlans);

module.exports = router;
