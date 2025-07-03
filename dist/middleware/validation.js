"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderSchema = exports.productSchema = exports.loginSchema = exports.registerSchema = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
const validateRequest = (schema) => {
    return (req, res, next) => {
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
exports.validateRequest = validateRequest;
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    fullName: joi_1.default.string().optional(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.productSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    description: joi_1.default.string().optional(),
    price: joi_1.default.number().positive().required(),
    image: joi_1.default.string().optional(),
    category: joi_1.default.string().valid('Non-Veg Pickles', 'Veg Pickles', 'Podulu', 'Snacks').optional(),
    stock: joi_1.default.number().integer().min(0).optional(),
    featured: joi_1.default.boolean().optional(),
});
exports.orderSchema = joi_1.default.object({
    items: joi_1.default.array().items(joi_1.default.object({
        productId: joi_1.default.string().required(),
        name: joi_1.default.string().required(),
        price: joi_1.default.number().positive().required(),
        quantity: joi_1.default.number().integer().positive().required(),
    })).min(1).required(),
    totalAmount: joi_1.default.number().positive().required(),
    shippingAddress: joi_1.default.string().optional(),
});
//# sourceMappingURL=validation.js.map