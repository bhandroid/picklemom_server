import mongoose, { Document, Schema } from 'mongoose';

export type ProductCategory = 'Non-Veg Pickles' | 'Veg Pickles' | 'Podulu' | 'Snacks';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: ProductCategory;
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Non-Veg Pickles', 'Veg Pickles', 'Podulu', 'Snacks'],
    index: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);