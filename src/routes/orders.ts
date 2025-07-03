import express from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { validateRequest, orderSchema } from '../middleware/validation';

const router = express.Router();

// Get user orders
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query = req.user?.isAdmin ? {} : { userId: req.user?._id };

    const orders = await Order.find(query)
      .populate('userId', 'email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Order.countDocuments(query);

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
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res): Promise<void> => {
  try {
    const query: any = { _id: req.params.id };
    
    // Non-admin users can only see their own orders
    if (!req.user?.isAdmin) {
      query.userId = req.user?._id;
    }

    const order = await Order.findOne(query).populate('userId', 'email fullName');

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
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
    return;
  }
});

// Create order
router.post('/', authenticate, validateRequest(orderSchema), async (req: AuthRequest, res): Promise<void> => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    // Verify products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
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

    // Create order
    const order = new Order({
      userId: req.user?._id,
      items,
      totalAmount,
      shippingAddress,
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
    return;
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

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
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
    return;
  }
});

export default router;