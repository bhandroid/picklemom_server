"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const query = req.user?.isAdmin ? {} : { userId: req.user?._id };
        const orders = await Order_1.Order.find(query)
            .populate('userId', 'email fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Order_1.Order.countDocuments(query);
        res.json({
            success: true,
            data: orders,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
        });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (!req.user?.isAdmin) {
            query.userId = req.user?._id;
        }
        const order = await Order_1.Order.findOne(query).populate('userId', 'email fullName');
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
            return;
        }
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
        });
        return;
    }
});
router.post('/', auth_1.authenticate, (0, validation_1.validateRequest)(validation_1.orderSchema), async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;
        for (const item of items) {
            const product = await Product_1.Product.findById(item.productId);
            if (!product) {
                res.status(400).json({
                    success: false,
                    message: `Product ${item.name} not found`,
                });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
                return;
            }
        }
        const order = new Order_1.Order({
            userId: req.user?._id,
            items,
            totalAmount,
            shippingAddress,
        });
        await order.save();
        for (const item of items) {
            await Product_1.Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
        });
        return;
    }
});
router.patch('/:id/status', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
            return;
        }
        const order = await Order_1.Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found',
            });
            return;
        }
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
        });
        return;
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map