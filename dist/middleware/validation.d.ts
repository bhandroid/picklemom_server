import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const productSchema: Joi.ObjectSchema<any>;
export declare const orderSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map