import mongoose, { Document } from 'mongoose';
export interface IPromoCode extends Document {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    validFrom: Date;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
    isValid(): boolean;
    calculateDiscount(orderAmount: number): number;
}
export declare const PromoCode: mongoose.Model<IPromoCode, {}, {}, {}, mongoose.Document<unknown, {}, IPromoCode, {}> & IPromoCode & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=PromoCode.d.ts.map