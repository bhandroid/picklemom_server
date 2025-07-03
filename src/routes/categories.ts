import express from 'express';
import { Product } from '../models/Product';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: categories.filter(Boolean), // Remove null/undefined values
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
});

export default router;