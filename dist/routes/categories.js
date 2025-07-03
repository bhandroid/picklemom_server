"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_1 = require("../models/Product");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const categories = await Product_1.Product.distinct('category');
        res.json({
            success: true,
            data: categories.filter(Boolean),
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
        });
    }
});
exports.default = router;
//# sourceMappingURL=categories.js.map