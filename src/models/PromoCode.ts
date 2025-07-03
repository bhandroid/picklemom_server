import mongoose, { Document, Schema } from 'mongoose';

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

const promoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrderAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0,
  },
  usageLimit: {
    type: Number,
    min: 1,
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  validFrom: {
    type: Date,
    required: true,
    index: true,
  },
  validUntil: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
promoCodeSchema.index({ code: 1, isActive: 1 });
promoCodeSchema.index({ validFrom: 1, validUntil: 1 });
promoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function(): boolean {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
};

// Method to calculate discount
promoCodeSchema.methods.calculateDiscount = function(orderAmount: number): number {
  if (!this.isValid() || orderAmount < this.minimumOrderAmount) {
    return 0;
  }

  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
      discount = this.maximumDiscountAmount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, orderAmount);
};

export const PromoCode = mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);