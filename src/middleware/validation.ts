import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    
    next();
  };
};

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
  image: Joi.string().optional(),
  category: Joi.string().valid('Non-Veg Pickles', 'Veg Pickles', 'Podulu', 'Snacks').optional(),
  stock: Joi.number().integer().min(0).optional(),
  featured: Joi.boolean().optional(),
});

export const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().positive().required(),
      quantity: Joi.number().integer().positive().required(),
    })
  ).min(1).required(),
  totalAmount: Joi.number().positive().required(),
  shippingAddress: Joi.string().optional(),
});