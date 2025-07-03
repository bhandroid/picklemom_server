import express from 'express';
import { PromoCode } from '../models/PromoCode';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const promoCodeSchema = Joi.object({
  code: Joi.string().required().uppercase().trim(),
  description: Joi.string().optional(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().positive().required(),
  minimumOrderAmount: Joi.number().min(0).optional(),
  maximumDiscountAmount: Joi.number().positive().optional(),
  usageLimit: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
  validFrom: Joi.date().required(),
  validUntil: Joi.date().greater(Joi.ref('validFrom')).required(),
});

const validatePromoSchema = Joi.object({
  code: Joi.string().required(),
  orderAmount: Joi.number().positive().required(),
});

// Get all promo codes (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const promoCodes = await PromoCode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await PromoCode.countDocuments(query);

    res.json({
      success: true,
      data: promoCodes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo codes',
    });
  }
});

// Get promo code by ID (admin only)
router.get('/:id', authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    
    if (!promoCode) {
      res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
      return;
    }

    res.json({
      success: true,
      data: promoCode,
    });
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch promo code',
    });
    return;
  }
});

// Validate promo code
router.post('/validate', authenticate, validateRequest(validatePromoSchema), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { code, orderAmount } = req.body;

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promoCode) {
      res.status(404).json({
        success: false,
        message: 'Invalid promo code',
      });
      return;
    }

    if (!promoCode.isValid()) {
      res.status(400).json({
        success: false,
        message: 'Promo code has expired or reached usage limit',
      });
      return;
    }

    if (promoCode.minimumOrderAmount !== undefined && orderAmount < promoCode.minimumOrderAmount) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${promoCode.minimumOrderAmount} required`,
      });
      return;
    }

    const discountAmount = promoCode.calculateDiscount(orderAmount);

    res.json({
      success: true,
      data: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        finalAmount: orderAmount - discountAmount,
      },
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code',
    });
    return;
  }
});

// Create promo code (admin only)
router.post('/', authenticate, requireAdmin, validateRequest(promoCodeSchema), async (req: AuthRequest, res): Promise<void> => {
  try {
    const promoCode = new PromoCode(req.body);
    await promoCode.save();

    res.status(201).json({
      success: true,
      data: promoCode,
    });
  } catch (error: any) {
    console.error('Create promo code error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Promo code already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create promo code',
    });
    return;
  }
});

// Update promo code (admin only)
router.put('/:id', authenticate, requireAdmin, validateRequest(promoCodeSchema), async (req: AuthRequest, res): Promise<void> => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promoCode) {
      res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
      return;
    }

    res.json({
      success: true,
      data: promoCode,
    });
  } catch (error: any) {
    console.error('Update promo code error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Promo code already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update promo code',
    });
    return;
  }
});

// Delete promo code (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promoCode) {
      res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promo code',
    });
    return;
  }
});

// Toggle promo code status (admin only)
router.patch('/:id/toggle', authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
      return;
    }

    promoCode.isActive = !promoCode.isActive;
    await promoCode.save();

    res.json({
      success: true,
      data: promoCode,
    });
  } catch (error) {
    console.error('Toggle promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle promo code status',
    });
    return;
  }
});

export default router;