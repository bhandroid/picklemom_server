import mongoose, { Document } from 'mongoose';
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
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map