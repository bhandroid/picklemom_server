"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PromoCode_1 = require("../models/PromoCode");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
const promoCodeSchema = joi_1.default.object({
    code: joi_1.default.string().required().uppercase().trim(),
    description: joi_1.default.string().optional(),
    discountType: joi_1.default.string().valid('percentage', 'fixed').required(),
    discountValue: joi_1.default.number().positive().required(),
    minimumOrderAmount: joi_1.default.number().min(0).optional(),
    maximumDiscountAmount: joi_1.default.number().positive().optional(),
    usageLimit: joi_1.default.number().integer().positive().optional(),
    isActive: joi_1.default.boolean().optional(),
    validFrom: joi_1.default.date().required(),
    validUntil: joi_1.default.date().greater(joi_1.default.ref('validFrom')).required(),
});
const validatePromoSchema = joi_1.default.object({
    code: joi_1.default.string().required(),
    orderAmount: joi_1.default.number().positive().required(),
});
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, active } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const query = {};
        if (active !== undefined) {
            query.isActive = active === 'true';
        }
        const promoCodes = await PromoCode_1.PromoCode.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await PromoCode_1.PromoCode.countDocuments(query);
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
    }
    catch (error) {
        console.error('Get promo codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch promo codes',
        });
    }
});
router.get('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const promoCode = await PromoCode_1.PromoCode.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Get promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch promo code',
        });
        return;
    }
});
router.post('/validate', auth_1.authenticate, (0, validation_1.validateRequest)(validatePromoSchema), async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        const promoCode = await PromoCode_1.PromoCode.findOne({
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
    }
    catch (error) {
        console.error('Validate promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate promo code',
        });
        return;
    }
});
router.post('/', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateRequest)(promoCodeSchema), async (req, res) => {
    try {
        const promoCode = new PromoCode_1.PromoCode(req.body);
        await promoCode.save();
        res.status(201).json({
            success: true,
            data: promoCode,
        });
    }
    catch (error) {
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
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateRequest)(promoCodeSchema), async (req, res) => {
    try {
        const promoCode = await PromoCode_1.PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
    }
    catch (error) {
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
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const promoCode = await PromoCode_1.PromoCode.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        console.error('Delete promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete promo code',
        });
        return;
    }
});
router.patch('/:id/toggle', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const promoCode = await PromoCode_1.PromoCode.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Toggle promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle promo code status',
        });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=promos.js.map