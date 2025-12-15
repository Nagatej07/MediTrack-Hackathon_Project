const MealPlan = require('../models/mealPlanModel');

// Save a new meal plan
exports.createMealPlan = async (req, res) => {
    try {
        const { meals } = req.body;
        const userId = req.user._id; // assuming auth middleware sets req.user

        if (!meals || !meals.length) {
            return res.status(400).json({ message: 'Meals data is required' });
        }

        const newMealPlan = new MealPlan({ userId, meals });
        await newMealPlan.save();

        res.status(201).json({ message: 'Meal plan saved successfully', mealPlan: newMealPlan });
    } catch (err) {
        console.error('Error saving meal plan:', err);
        res.status(500).json({ message: 'Server error while saving meal plan' });
    }
};

// Get all meal plans for a user
exports.getUserMealPlans = async (req, res) => {
    try {
        const userId = req.user._id;
        const mealPlans = await MealPlan.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(mealPlans);
    } catch (err) {
        console.error('Error fetching meal plans:', err);
        res.status(500).json({ message: 'Server error while fetching meal plans' });
    }
};
