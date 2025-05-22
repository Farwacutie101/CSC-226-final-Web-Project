const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// POST: Add a new review
router.post('/', async (req, res) => {
  try {
    const { productId, user, rating, comment } = req.body;

    const newReview = new Review({
      productId,
      user,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review', error });
  }
});

// GET: Get reviews for a specific product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
});

module.exports = router;
