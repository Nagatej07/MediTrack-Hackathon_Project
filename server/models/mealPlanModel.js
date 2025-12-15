const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    meal: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: String, required: true },
    timestamp: { type: Date, required: true },
    notes: { type: String, required: false }
});

const mealPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meals: [mealSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);
