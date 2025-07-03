"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, featured, search, page = 1, limit = 20 } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (featured === 'true') {
            query.featured = true;
        }
        if (search) {
            query.$text = { $search: search };
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const products = await Product_1.Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Product_1.Product.countDocuments(query);
        res.json({
            success: true,
            data: products,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
        return;
    }
});
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Product_1.Product.find({ category }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products by category',
        });
    }
});
router.post('/', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateRequest)(validation_1.productSchema), async (req, res) => {
    try {
        const product = new Product_1.Product(req.body);
        await product.save();
        res.status(201).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
        });
        return;
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, (0, validation_1.validateRequest)(validation_1.productSchema), async (req, res) => {
    try {
        const product = await Product_1.Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
        return;
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const product = await Product_1.Product.findByIdAndDelete(req.params.id);
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
        });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=products.js.map